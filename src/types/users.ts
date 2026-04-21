export type UserStatus = "active" | "inactive" | "pending" | "blacklisted";

export type UserRow = {
  id: string;
  organization: string;
  username: string;
  email: string;
  phone: string;
  dateJoined: string;
  status: UserStatus;
  /** When provided by the list API or mock seed, used for dashboard summary counts. */
  hasLoan?: boolean;
  hasSavings?: boolean;
};

export type Guarantor = {
  fullName: string;
  phone: string;
  email: string;
  relationship: string;
};

export type UserDetailProfile = {
  userCode: string;
  tierLevel: number;
  tierLabel: string;
  bankName: string;
  accountNumber: string;
  amountGuaranteed: string;
  bvn: string;
  guarantors: Guarantor[];
  gender: string;
  maritalStatus: string;
  children: string;
  typeOfResidence: string;
  address: string;
  educationLevel: string;
  employmentStatus: string;
  sector: string;
  duration: string;
  officeEmail: string;
  monthlyIncome: string;
  loanRepayment: string;
  twitter: string;
  facebook: string;
  instagram: string;
};

export type UserDetailData = UserRow & { profile: UserDetailProfile };

