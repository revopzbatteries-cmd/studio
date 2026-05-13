"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { checkPasswordStrength } from '@/lib/validations';
import { toDisplayRole } from '@/lib/rbac';
import { getInitials } from '@/lib/adminService';
import type { AdminProfile } from '@/lib/adminService';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Loader2,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminProfile: AdminProfile;
  permissions: string[];
  onProfileUpdated: (updates: { name?: string; email?: string }) => void;
}

type Section = 'info' | 'password';

export function EditProfileModal({
  open,
  onOpenChange,
  adminProfile,
  permissions,
  onProfileUpdated,
}: EditProfileModalProps) {
  const { toast } = useToast();

  const [section, setSection] = useState<Section>('info');
  const [isSaving, setIsSaving] = useState(false);

  // ── Basic Info state ─────────────────────────────────────────────────────
  const [name, setName] = useState(adminProfile.name);
  const [email, setEmail] = useState(adminProfile.email);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  // ── Password state ────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const passwordConditions = checkPasswordStrength(newPassword);
  const passwordMet = passwordConditions.filter(c => c.met).length;
  const passwordStrength =
    passwordMet === 5 ? 'strong' : passwordMet >= 3 ? 'medium' : 'weak';

  // Reset form on open
  useEffect(() => {
    if (open) {
      setSection('info');
      setName(adminProfile.name);
      setEmail(adminProfile.email);
      setNameError('');
      setEmailError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPasswordError('');
      setNewPasswordError('');
      setConfirmPasswordError('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [open, adminProfile]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateInfo = () => {
    let valid = true;
    if (!name.trim() || name.trim().length < 3) {
      setNameError('Name must be at least 3 characters.');
      valid = false;
    } else {
      setNameError('');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }
    return valid;
  };

  const validatePassword = () => {
    let valid = true;
    if (!currentPassword) {
      setCurrentPasswordError('Current password is required.');
      valid = false;
    } else {
      setCurrentPasswordError('');
    }
    if (passwordMet < 5) {
      setNewPasswordError('Password must meet all requirements.');
      valid = false;
    } else {
      setNewPasswordError('');
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      valid = false;
    } else {
      setConfirmPasswordError('');
    }
    return valid;
  };

  // ── Submit handlers ────────────────────────────────────────────────────────
  const handleSaveInfo = async () => {
    if (!validateInfo()) return;

    const nameChanged = name.trim() !== adminProfile.name;
    const emailChanged = email.trim().toLowerCase() !== adminProfile.email;
    if (!nameChanged && !emailChanged) {
      toast({ title: 'No changes', description: 'Nothing was changed.' });
      return;
    }

    setIsSaving(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated.');

      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase() }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Update failed.');

      onProfileUpdated({ name: name.trim(), email: email.trim().toLowerCase() });
      toast({ title: '✅ Profile updated', description: 'Your info has been saved.' });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!validatePassword()) return;

    setIsSaving(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) throw new Error('Not authenticated.');

      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential).catch(() => {
        throw new Error('Current password is incorrect.');
      });

      const idToken = await auth.currentUser?.getIdToken(true);
      if (!idToken) throw new Error('Failed to get auth token.');

      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ newPassword }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Password update failed.');

      toast({ title: '🔒 Password updated', description: 'Your new password is active.' });
      onOpenChange(false);
    } catch (err: any) {
      if (err.message.includes('incorrect') || err.message.includes('INVALID_LOGIN_CREDENTIALS')) {
        setCurrentPasswordError('Current password is incorrect.');
      } else {
        toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ── Derived display values ────────────────────────────────────────────────
  const displayRole = toDisplayRole(adminProfile.role);
  const initials = getInitials(adminProfile.name);

  const roleBadgeClass =
    displayRole === 'Manager'
      ? 'bg-primary text-primary-foreground'
      : displayRole === 'Product Manager'
      ? 'bg-blue-500 text-white'
      : 'bg-orange-500 text-white';

  const strengthColor =
    passwordStrength === 'strong'
      ? 'bg-green-500'
      : passwordStrength === 'medium'
      ? 'bg-yellow-500'
      : 'bg-destructive';

  const strengthTextColor =
    passwordStrength === 'strong'
      ? 'text-green-500'
      : passwordStrength === 'medium'
      ? 'text-yellow-500'
      : 'text-destructive';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*
        Layout: DialogContent is a flex column with overflow-hidden.
        Only the body div has overflow-y-auto + flex-1 so it's the
        only region that scrolls. Header, tabs, and footer stay fixed.
      */}
      <DialogContent
        className="bg-card border-border sm:max-w-lg p-0 gap-0 flex flex-col max-h-[90svh] overflow-hidden"
      >
        {/* ── Fixed Header ─────────────────────────────────────────────── */}
        <div className="shrink-0 bg-primary/10 border-b border-primary/20 px-6 pt-6 pb-5">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-white border-4 border-background shadow-lg shrink-0 select-none">
                {initials}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{adminProfile.name}</DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm mt-0.5">
                  {adminProfile.email}
                </DialogDescription>
                <Badge className={`mt-1.5 text-xs ${roleBadgeClass}`}>{displayRole}</Badge>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* ── Fixed Tab Switcher ───────────────────────────────────────── */}
        <div className="shrink-0 flex border-b border-border bg-card">
          <button
            onClick={() => setSection('info')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              section === 'info'
                ? 'text-primary border-b-2 border-primary -mb-px bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <User size={15} /> Basic Info
          </button>
          <button
            onClick={() => setSection('password')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              section === 'password'
                ? 'text-primary border-b-2 border-primary -mb-px bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <Lock size={15} /> Change Password
          </button>
        </div>

        {/* ── Scrollable Body ─────────────────────────────────────────── */}
        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5 space-y-5"
          style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {/* SECTION 1 — Basic Info */}
          {section === 'info' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="ep-name" className="flex items-center gap-1.5 text-sm font-medium">
                  <User size={13} className="text-muted-foreground" /> Full Name
                </Label>
                <Input
                  id="ep-name"
                  value={name}
                  onChange={e => { setName(e.target.value); if (nameError) setNameError(''); }}
                  placeholder="Your full name"
                  className={nameError ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {nameError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <X size={11} /> {nameError}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ep-email" className="flex items-center gap-1.5 text-sm font-medium">
                  <Mail size={13} className="text-muted-foreground" /> Email Address
                </Label>
                <Input
                  id="ep-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                  placeholder="email@revopz.com"
                  className={emailError ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {emailError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <X size={11} /> {emailError}
                  </p>
                )}
              </div>

              {/* Read-only Role */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <ShieldCheck size={13} className="text-muted-foreground" /> Role
                </Label>
                <div className="flex items-center h-9 px-3 rounded-md border border-border bg-muted/30 text-sm text-muted-foreground gap-2">
                  <Badge className={`text-xs ${roleBadgeClass}`}>{displayRole}</Badge>
                  <span className="text-xs">(assigned by super admin)</span>
                </div>
              </div>

              {/* Read-only Permissions */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <KeyRound size={13} className="text-muted-foreground" /> Permissions
                </Label>
                <div className="rounded-md border border-border bg-muted/20 px-3 py-2.5 space-y-1.5">
                  {permissions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No permissions assigned.</p>
                  ) : (
                    permissions.map(p => (
                      <div key={p} className="flex items-center gap-1.5 text-xs text-foreground/80">
                        <CheckCircle2 size={11} className="text-primary shrink-0" />
                        {p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* SECTION 2 — Change Password */}
          {section === 'password' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="ep-current" className="text-sm font-medium">Current Password</Label>
                <div className="relative">
                  <Input
                    id="ep-current"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => { setCurrentPassword(e.target.value); if (currentPasswordError) setCurrentPasswordError(''); }}
                    placeholder="••••••••"
                    className={`pr-10 ${currentPasswordError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(v => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {currentPasswordError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <X size={11} /> {currentPasswordError}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ep-new" className="text-sm font-medium">New Password</Label>
                <div className="relative">
                  <Input
                    id="ep-new"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); if (newPasswordError) setNewPasswordError(''); }}
                    placeholder="••••••••"
                    className={`pr-10 ${newPasswordError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(v => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Strength meter */}
                {newPassword.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                          style={{ width: `${(passwordMet / 5) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold capitalize ${strengthTextColor}`}>
                        {passwordStrength}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {passwordConditions.map(c => (
                        <li
                          key={c.label}
                          className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                            c.met ? 'text-green-500' : 'text-muted-foreground'
                          }`}
                        >
                          {c.met ? <CheckCircle2 size={11} /> : <X size={11} />}
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {newPasswordError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <X size={11} /> {newPasswordError}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ep-confirm" className="text-sm font-medium">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="ep-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); if (confirmPasswordError) setConfirmPasswordError(''); }}
                    placeholder="••••••••"
                    className={`pr-10 ${confirmPasswordError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <X size={11} /> {confirmPasswordError}
                  </p>
                )}
                {confirmPassword && confirmPassword === newPassword && (
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Passwords match
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Fixed Footer ─────────────────────────────────────────────── */}
        <DialogFooter className="shrink-0 px-6 pb-5 pt-3 border-t border-border bg-card/95 backdrop-blur-sm">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={section === 'info' ? handleSaveInfo : handleSavePassword}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 min-w-[130px]"
          >
            {isSaving ? (
              <><Loader2 size={14} className="mr-2 animate-spin" /> Saving…</>
            ) : section === 'info' ? (
              'Save Changes'
            ) : (
              'Update Password'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
