import { Link, useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  Receipt,
  Upload,
  Wallet as WalletIcon,
  ArrowDownToLine,
  Settings,
  Shield,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export function UserMenu() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const initial = (profile?.display_name || profile?.username || user.email || "?")
    .charAt(0)
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground font-bold text-sm overflow-hidden ring-2 ring-border hover:ring-primary transition-colors"
          style={{ background: "var(--gradient-primary)" }}
          aria-label="User menu"
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-semibold truncate">
              {profile?.display_name || profile?.username || "User"}
            </span>
            <span className="text-xs text-muted-foreground">Balance</span>
            <span className="text-sm font-mono font-bold text-primary">
              {Number(profile?.balance_eth ?? 0).toFixed(4)} ETH
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" /> My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wallet" className="cursor-pointer">
            <Receipt className="mr-2 h-4 w-4" /> Transactions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/upload" className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" /> Upload NFT
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wallet" className="cursor-pointer">
            <WalletIcon className="mr-2 h-4 w-4" /> Fund Wallet
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wallet" className="cursor-pointer">
            <ArrowDownToLine className="mr-2 h-4 w-4" /> Withdraw Funds
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings/profile" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" /> Edit Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings/security" className="cursor-pointer">
            <Shield className="mr-2 h-4 w-4" /> Security
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin" className="cursor-pointer">
                <ShieldCheck className="mr-2 h-4 w-4 text-primary" /> Admin Panel
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SignInButtons() {
  return (
    <>
      <Link to="/login" className="hidden sm:block">
        <Button variant="ghost" size="sm">Sign in</Button>
      </Link>
      <Link to="/register" className="hidden sm:block">
        <Button size="sm" variant="hero">Get Started</Button>
      </Link>
    </>
  );
}
