import type {
  Guarantor,
  UserDetailData,
  UserDetailProfile,
  UserRow,
  UserStatus,
} from "@/types/users";

/** Fixed mock list size for the local mock API (`/api/users`). */
export const MOCK_USER_DATASET_SIZE = 500;

const ORGS = ["Lendsqr", "Irorun", "Lendstar", "Kernel", "Polaris", "Nexa"];
const STATUSES: UserStatus[] = [
  "active",
  "inactive",
  "pending",
  "blacklisted",
];

const BASE_ROWS: UserRow[] = [
  {
    id: "1",
    organization: "Lendsqr",
    username: "Grace Effiom",
    email: "grace@gmail.com",
    phone: "07060780922",
    dateJoined: "May 15, 2020 10:00 AM",
    status: "inactive",
    hasLoan: false,
    hasSavings: true,
  },
  {
    id: "2",
    organization: "Irorun",
    username: "Debby Ogana",
    email: "debby@irorun.com",
    phone: "08160708942",
    dateJoined: "Apr 30, 2020 10:00 AM",
    status: "pending",
    hasLoan: true,
    hasSavings: false,
  },
  {
    id: "3",
    organization: "Lendstar",
    username: "Tosin Dokunmu",
    email: "tosin@lendstar.com",
    phone: "07003309221",
    dateJoined: "Apr 27, 2020 10:00 AM",
    status: "blacklisted",
    hasLoan: true,
    hasSavings: true,
  },
  {
    id: "4",
    organization: "Lendsqr",
    username: "Adedeji",
    email: "adedeji@lendsqr.com",
    phone: "08078903621",
    dateJoined: "Apr 27, 2020 10:00 AM",
    status: "pending",
    hasLoan: true,
    hasSavings: true,
  },
  {
    id: "5",
    organization: "Lendsqr",
    username: "Michael Oluwatosin",
    email: "michael@lendsqr.com",
    phone: "08078903621",
    dateJoined: "Apr 27, 2020 10:00 AM",
    status: "active",
    hasLoan: true,
    hasSavings: true,
  },
  {
    id: "6",
    organization: "Lendsqr",
    username: "Chidi Ugwu",
    email: "chidi@lendsqr.com",
    phone: "08160708942",
    dateJoined: "Apr 27, 2020 10:00 AM",
    status: "active",
    hasLoan: true,
    hasSavings: false,
  },
];

function padMonth(m: number) {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m];
}

function syntheticRow(index: number): UserRow {
  const id = String(index);
  const d = new Date(2020, (index % 12), (index % 28) + 1, 10, 0, 0, 0);
  const dateJoined = `${padMonth(d.getMonth())} ${d.getDate()}, ${d.getFullYear()} 10:00 AM`;
  return {
    id,
    organization: ORGS[index % ORGS.length],
    username: `Demo User ${index}`,
    email: `user${index}@mock.lendsqr.test`,
    phone: `080${String(1_000_000 + (index % 89_999_999)).padStart(8, "0")}`.slice(0, 11),
    dateJoined,
    status: STATUSES[index % STATUSES.length],
    hasLoan: index % 2 === 0,
    hasSavings: index % 3 !== 0,
  };
}

let cachedRows: UserRow[] | null = null;

export function getMockUserRows(): UserRow[] {
  if (cachedRows) return cachedRows;
  const rows: UserRow[] = [...BASE_ROWS];
  for (let i = BASE_ROWS.length + 1; i <= MOCK_USER_DATASET_SIZE; i++) {
    rows.push(syntheticRow(i));
  }
  cachedRows = rows;
  return cachedRows;
}

export function getMockUserRowById(id: string): UserRow | undefined {
  const n = Number(id);
  if (!Number.isFinite(n) || n < 1 || n > MOCK_USER_DATASET_SIZE) return undefined;
  return getMockUserRows()[n - 1];
}

function profileForUser(row: UserRow): UserDetailProfile {
  const suffix = row.id.padStart(3, "0");
  const maleNames = ["Adedeji", "Michael", "Chidi", "Tosin"];
  const isMale = maleNames.some((n) => row.username.includes(n));
  const defaultGuarantor: Guarantor = {
    fullName: "Debby Ogana",
    phone: "07060780922",
    email: "debby@gmail.com",
    relationship: "Sister",
  };

  if (row.id === "1") {
    return {
      userCode: "LSQF1587g90",
      tierLevel: 1,
      tierLabel: "User's Tier",
      bankName: "Providus Bank",
      accountNumber: "9912345678",
      amountGuaranteed: "₦200,000.00",
      bvn: "07060780922",
      gender: "Female",
      maritalStatus: "Single",
      children: "None",
      typeOfResidence: "Parent's Apartment",
      address: "14B, Adeyemo Drive, Ikoyi, Lagos",
      educationLevel: "B.Sc",
      employmentStatus: "Employed",
      sector: "FinTech",
      duration: "2 years",
      officeEmail: "grace@lendsqr.com",
      monthlyIncome: "₦200,000.00 - ₦400,000.00",
      loanRepayment: "40,000",
      twitter: "@grace_effiom",
      facebook: "Grace Effiom",
      instagram: "@grace_effiom",
      guarantors: [defaultGuarantor, { ...defaultGuarantor }],
    };
  }

  return {
    userCode: `LSQRF-${suffix}`,
    tierLevel: row.status === "blacklisted" ? 0 : 2,
    tierLabel: row.status === "blacklisted" ? "Blacklisted" : "User's Tier",
    bankName: "Providus Bank",
    accountNumber: `991234${suffix}`,
    amountGuaranteed: "₦200,000.00",
    bvn: `234${suffix}89012`,
    gender: isMale ? "Male" : "Female",
    maritalStatus: "Single",
    children: "None",
    typeOfResidence: "Parent's Apartment",
    address: "14B, Adeyemo Drive, Ikoyi, Lagos",
    educationLevel: "B.Sc. Computer Science",
    employmentStatus: "Employed",
    sector: "FinTech",
    duration: "2 years +",
    officeEmail: row.email,
    monthlyIncome: "₦200,000.00 - ₦400,000.00",
    loanRepayment: "40,000",
    twitter: "@lendsqr",
    facebook: "lendsqr",
    instagram: "@lendsqr",
    guarantors: [defaultGuarantor],
  };
}

export function buildUserDetailData(row: UserRow): UserDetailData {
  return { ...row, profile: profileForUser(row) };
}
