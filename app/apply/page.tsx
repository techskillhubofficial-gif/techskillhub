"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  FileCheck2,
  GraduationCap,
  IndianRupee,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  duration: string;
  price: number;
};

type FormData = {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  dateOfBirth: string;
  gender: string;

  city: string;
  state: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;

  parentName: string;
  parentRelation: string;
  parentPhone: string;
  parentEmail: string;
  parentOccupation: string;

  educationLevel: string;
  institutionName: string;
  graduationYear: string;
  educationDetails: string;

  courseId: string;
  program: string;
  currentOccupation: string;
  careerGoal: string;

  concessionPercent: string;

  declarationAccepted: boolean;
  privacyConsent: boolean;
  marketingConsent: boolean;
  parentConsentRequired: boolean;
  parentConsent: boolean;
};

type Financials = {
  standardFee: number;
  concessionPercent: number;
  concessionAmount: number;
  totalFee: number;
  registrationFee: number;
  firstLectureFee: number;
  balanceFee: number;
};

type SuccessData = {
  applicationNo: string;
  financials: Financials;
};

type RegistrationVerification = {
  id: string;
  registrationNo: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  amount: number;
  mode: string;
  status: string;
  applicationId: string | null;
  submittedAt: string;
  verifiedAt: string | null;
  rejectionReason?: string;
  course: {
    id: string;
    title: string;
    slug: string;
  };
};

const DRAFT_KEY = "techskillhub-admission-draft";

const STEPS = [
  {
    number: "01",
    short: "Personal",
    title: "About you",
    description: "Let's start with your basic information.",
    icon: UserRound,
  },
  {
    number: "02",
    short: "Guardian",
    title: "Parent / guardian",
    description: "Tell us who we can contact when needed.",
    icon: UsersRound,
  },
  {
    number: "03",
    short: "Address",
    title: "Where you live",
    description: "Add your current residential details.",
    icon: MapPin,
  },
  {
    number: "04",
    short: "Education",
    title: "Your background",
    description: "Help us understand your academic journey.",
    icon: GraduationCap,
  },
  {
    number: "05",
    short: "Program",
    title: "Choose your path",
    description: "Select the program that fits your goals.",
    icon: Sparkles,
  },
  {
    number: "06",
    short: "Fees",
    title: "Review your investment",
    description: "Understand the complete fee structure.",
    icon: WalletCards,
  },
  {
    number: "07",
    short: "Review",
    title: "Review application",
    description: "Check everything before submitting.",
    icon: FileCheck2,
  },
];

const INITIAL_FORM: FormData = {
  studentName: "",
  studentEmail: "",
  studentPhone: "",
  dateOfBirth: "",
  gender: "",

  city: "",
  state: "",
  addressLine1: "",
  addressLine2: "",
  postalCode: "",

  parentName: "",
  parentRelation: "",
  parentPhone: "",
  parentEmail: "",
  parentOccupation: "",

  educationLevel: "",
  institutionName: "",
  graduationYear: "",
  educationDetails: "",

  courseId: "",
  program: "",
  currentOccupation: "",
  careerGoal: "",

  concessionPercent: "0",

  declarationAccepted: false,
  privacyConsent: false,
  marketingConsent: false,
  parentConsentRequired: false,
  parentConsent: false,
};

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getAge(dateOfBirth: string) {
  if (!dateOfBirth) {
    return null;
  }

  const dob = new Date(`${dateOfBirth}T00:00:00`);

  if (Number.isNaN(dob.getTime())) {
    return null;
  }

  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  const monthDifference = today.getMonth() - dob.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
}

function ApplyPageContent() {
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [courses, setCourses] = useState<Course[]>([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState<SuccessData | null>(null);

  const requestedProgram =
    searchParams.get("program")?.trim().toLowerCase() || "";

  const registrationNoFromUrl =
    searchParams.get("registrationNo")?.trim().toUpperCase() || "";

  const registrationContactFromUrl =
    searchParams.get("email")?.trim().toLowerCase() ||
    searchParams.get("phone")?.trim() ||
    "";

  const [registrationContact, setRegistrationContact] = useState(
    registrationContactFromUrl
  );
  const [registrationVerification, setRegistrationVerification] =
    useState<RegistrationVerification | null>(null);
  const [verifyingRegistration, setVerifyingRegistration] = useState(false);
  const [registrationGateError, setRegistrationGateError] = useState("");

  useEffect(() => {
    if (
      registrationContactFromUrl &&
      registrationContact !== registrationContactFromUrl
    ) {
      setRegistrationContact(registrationContactFromUrl);
    }
  }, [registrationContactFromUrl, registrationContact]);

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);

      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);

        setForm({
          ...INITIAL_FORM,
          ...parsed,
        });
      }
    } catch (draftError) {
      console.error("DRAFT_LOAD_ERROR", draftError);
    } finally {
      setLoadingDraft(false);
    }
  }, []);

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoadingCourses(true);

        const response = await fetch("/api/courses", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load programs.");
        }

        setCourses(data.courses || []);
      } catch (courseError) {
        console.error("COURSES_LOAD_ERROR", courseError);
        setError(
          "We couldn't load the available programs. Please refresh the page and try again."
        );
      } finally {
        setLoadingCourses(false);
      }
    }

    loadCourses();
  }, []);

  useEffect(() => {
    if (!requestedProgram || courses.length === 0 || loadingDraft) {
      return;
    }

    const matchingCourse = courses.find(
      (course) =>
        course.slug.toLowerCase() === requestedProgram ||
        course.title.toLowerCase() === requestedProgram
    );

    if (!matchingCourse) {
      return;
    }

    setForm((current) => ({
      ...current,
      courseId: matchingCourse.id,
      program: matchingCourse.title,
    }));
  }, [requestedProgram, courses, loadingDraft]);

  const studentAge = useMemo(
    () => getAge(form.dateOfBirth),
    [form.dateOfBirth]
  );

  useEffect(() => {
    if (studentAge === null) {
      return;
    }

    if (studentAge < 18 && !form.parentConsentRequired) {
      setForm((current) => ({
        ...current,
        parentConsentRequired: true,
      }));
    }
  }, [studentAge, form.parentConsentRequired]);

  useEffect(() => {
    if (loadingDraft || success) {
      return;
    }

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch (draftError) {
      console.error("DRAFT_SAVE_ERROR", draftError);
    }
  }, [form, loadingDraft, success]);

  const selectedCourse = useMemo(() => {
    return courses.find((course) => course.id === form.courseId) || null;
  }, [courses, form.courseId]);

  const financials = useMemo<Financials>(() => {
    const standardFee = selectedCourse?.price || 49999;

    const concessionPercent = Math.min(
      100,
      Math.max(0, Number(form.concessionPercent) || 0)
    );

    const concessionAmount = Math.round(
      standardFee * (concessionPercent / 100)
    );

    const totalFee = Math.max(0, standardFee - concessionAmount);

    const registrationFee = Math.min(5000, totalFee);

    const firstLectureFee = Math.min(
      10000,
      Math.max(0, totalFee - registrationFee)
    );

    const balanceFee = Math.max(
      0,
      totalFee - registrationFee - firstLectureFee
    );

    return {
      standardFee,
      concessionPercent,
      concessionAmount,
      totalFee,
      registrationFee,
      firstLectureFee,
      balanceFee,
    };
  }, [selectedCourse, form.concessionPercent]);

  function updateField<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

  function validateStep(stepNumber: number) {
    setError("");

    if (stepNumber === 0) {
      if (!form.studentName.trim()) {
        setError("Please enter the applicant's full name.");
        return false;
      }

      if (!form.studentEmail.trim()) {
        setError("Please enter the applicant's email address.");
        return false;
      }

      if (!/^\S+@\S+\.\S+$/.test(form.studentEmail.trim())) {
        setError("Please enter a valid email address.");
        return false;
      }

      if (!form.studentPhone.trim()) {
        setError("Please enter the applicant's mobile number.");
        return false;
      }

      if (form.studentPhone.replace(/\D/g, "").length < 10) {
        setError("Please enter a valid 10-digit mobile number.");
        return false;
      }

      return true;
    }

    if (stepNumber === 1) {
      if (!form.parentName.trim()) {
        setError("Please enter the parent/guardian name.");
        return false;
      }

      if (!form.parentRelation.trim()) {
        setError("Please select the relationship.");
        return false;
      }

      if (!form.parentPhone.trim()) {
        setError("Please enter the parent/guardian mobile number.");
        return false;
      }

      if (form.parentPhone.replace(/\D/g, "").length < 10) {
        setError("Please enter a valid parent/guardian mobile number.");
        return false;
      }

      if (
        form.parentEmail.trim() &&
        !/^\S+@\S+\.\S+$/.test(form.parentEmail.trim())
      ) {
        setError("Please enter a valid parent/guardian email address.");
        return false;
      }

      if (form.parentConsentRequired && !form.parentConsent) {
        setError(
          "Parent/guardian consent is required for this application."
        );
        return false;
      }

      return true;
    }

    if (stepNumber === 2) {
      if (!form.addressLine1.trim()) {
        setError("Please enter your address.");
        return false;
      }

      if (!form.city.trim()) {
        setError("Please enter your city.");
        return false;
      }

      if (!form.state.trim()) {
        setError("Please enter your state.");
        return false;
      }

      if (!form.postalCode.trim()) {
        setError("Please enter your postal/PIN code.");
        return false;
      }

      return true;
    }

    if (stepNumber === 3) {
      if (!form.educationLevel.trim()) {
        setError("Please select your highest education level.");
        return false;
      }

      if (!form.institutionName.trim()) {
        setError("Please enter your institution name.");
        return false;
      }

      return true;
    }

    if (stepNumber === 4) {
      if (!form.courseId || !selectedCourse) {
        setError("Please select one of the available programs.");
        return false;
      }

      if (!form.careerGoal.trim()) {
        setError("Please tell us about your career goal.");
        return false;
      }

      return true;
    }

    if (stepNumber === 5) {
      const concession = Number(form.concessionPercent);

      if (
        Number.isNaN(concession) ||
        concession < 0 ||
        concession > 100
      ) {
        setError("Concession must be between 0% and 100%.");
        return false;
      }

      return true;
    }

    if (stepNumber === 6) {
      if (!form.declarationAccepted) {
        setError("Please accept the applicant declaration.");
        return false;
      }

      if (!form.privacyConsent) {
        setError(
          "Please acknowledge the privacy and data-processing terms."
        );
        return false;
      }

      if (form.parentConsentRequired && !form.parentConsent) {
        setError("Parent/guardian consent is required.");
        return false;
      }

      return true;
    }

    return true;
  }

  function goNext() {
    if (!validateStep(step)) {
      return;
    }

    setStep((current) =>
      Math.min(STEPS.length - 1, current + 1)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goBack() {
    setError("");

    setStep((current) => Math.max(0, current - 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goToStep(index: number) {
    if (index >= step) {
      return;
    }

    setError("");
    setStep(index);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function verifyRegistration() {
    const registrationNo = registrationNoFromUrl;

    const contact = registrationContact.trim();

    if (!registrationNo) {
      setRegistrationGateError(
        "A verified registration is required before starting the admission application."
      );
      return;
    }

    if (!contact) {
      setRegistrationGateError(
        "Enter the email address or mobile number used during registration."
      );
      return;
    }

    setVerifyingRegistration(true);
    setRegistrationGateError("");
    setRegistrationVerification(null);

    try {
      const isEmail = contact.includes("@");

      const params = new URLSearchParams({
        registrationNo,
      });

      if (isEmail) {
        params.set("email", contact.toLowerCase());
      } else {
        params.set("phone", contact.replace(/\D/g, ""));
      }

      const response = await fetch(
        `/api/registration-payments/status?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success || !data.payment) {
        throw new Error(
          data.message ||
            "We couldn't verify this registration."
        );
      }

      const payment = data.payment as RegistrationVerification;

      if (payment.status === "PENDING") {
        throw new Error(
          "Your registration payment is still pending admin verification. Please wait until it is verified before starting the admission application."
        );
      }

      if (payment.status !== "VERIFIED") {
        throw new Error(
          payment.rejectionReason
            ? `This registration payment was not verified: ${payment.rejectionReason}`
            : "This registration payment is not verified yet."
        );
      }

      if (payment.applicationId) {
        throw new Error(
          "An admission application is already linked to this registration."
        );
      }

      setRegistrationVerification(payment);

      setForm((current) => ({
        ...current,
        studentName: payment.studentName || current.studentName,
        studentEmail: payment.studentEmail || current.studentEmail,
        studentPhone: payment.studentPhone || current.studentPhone,
        courseId: payment.course.id,
        program: payment.course.title,
      }));

      localStorage.removeItem(DRAFT_KEY);
    } catch (verificationError) {
      console.error(
        "REGISTRATION_VERIFICATION_ERROR",
        verificationError
      );

      setRegistrationGateError(
        verificationError instanceof Error
          ? verificationError.message
          : "We couldn't verify your registration."
      );
    } finally {
      setVerifyingRegistration(false);
    }
  }

  async function submitApplication() {
    if (!registrationVerification) {
      setRegistrationGateError(
        "Please verify your registration before submitting the admission application."
      );
      return;
    }

    if (registrationVerification.status !== "VERIFIED") {
      setRegistrationGateError(
        "Your registration payment must be verified before submitting the admission application."
      );
      return;
    }

    if (!validateStep(6)) {
      return;
    }

    if (!selectedCourse) {
      setError("Please select a valid program.");
      setStep(4);
      return;
    }

    if (
      registrationVerification.course.id !== selectedCourse.id
    ) {
      setError(
        "The selected program does not match your verified registration. Please use the program reserved during registration."
      );
      setStep(4);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        registrationPaymentId: registrationVerification.id,

        studentName: form.studentName.trim(),
        studentEmail: form.studentEmail.trim(),
        studentPhone: form.studentPhone.trim(),

        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,

        city: form.city.trim(),
        state: form.state.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || undefined,
        postalCode: form.postalCode.trim(),

        parentName: form.parentName.trim(),
        parentRelation: form.parentRelation.trim(),
        parentPhone: form.parentPhone.trim(),
        parentEmail: form.parentEmail.trim() || undefined,
        parentOccupation:
          form.parentOccupation.trim() || undefined,

        educationLevel: form.educationLevel.trim(),
        institutionName: form.institutionName.trim(),
        graduationYear: form.graduationYear
          ? Number(form.graduationYear)
          : undefined,
        educationDetails:
          form.educationDetails.trim() || undefined,

        courseId: selectedCourse.id,
        program: selectedCourse.title,

        currentOccupation:
          form.currentOccupation.trim() || undefined,

        careerGoal: form.careerGoal.trim(),

        concessionPercent: financials.concessionPercent,

        status: "SUBMITTED",

        applicantDeclarationAccepted: form.declarationAccepted,
        privacyConsentAccepted: form.privacyConsent,
        marketingConsentAccepted: form.marketingConsent,

        parentConsentRequired: form.parentConsentRequired,
        parentConsentAccepted: form.parentConsent,
      };

      const response = await fetch(
        "/api/admission-applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "We couldn't submit your application."
        );
      }

      localStorage.removeItem(DRAFT_KEY);

      setSuccess({
        applicationNo: data.data.applicationNo,
        financials: data.data.financials,
      });
    } catch (submitError) {
      console.error(
        "APPLICATION_SUBMIT_ERROR",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while submitting your application."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingDraft || loadingCourses) {
    return <LoadingScreen />;
  }

  if (success) {
    return (
      <SuccessScreen
        applicationNo={success.applicationNo}
        financials={success.financials}
      />
    );
  }

  if (!registrationVerification) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] text-slate-950">
        <PublicHeader />

        <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[1440px] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-xl">
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-8 text-white sm:px-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                  TechSkillHub Admissions
                </p>

                <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  Verify your registration
                </h1>

                <p className="mt-3 text-sm leading-6 text-blue-50">
                  Your ₹5,000 registration must be verified before you can
                  continue with the full admission application.
                </p>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                    Registration number
                  </p>

                  <p className="mt-2 font-mono text-lg font-bold tracking-wide text-slate-950">
                    {registrationNoFromUrl || "Not provided"}
                  </p>
                </div>

                {!registrationNoFromUrl && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                    Please start your application from the registration
                    confirmation page so we can identify your reserved seat.
                  </div>
                )}

                <div>
                  <label
                    htmlFor="registration-contact"
                    className="mb-2 block text-sm font-semibold text-slate-900"
                  >
                    Registered email or mobile number
                  </label>

                  <input
                    id="registration-contact"
                    type="text"
                    value={registrationContact}
                    onChange={(event) => {
                      setRegistrationContact(event.target.value);
                      setRegistrationGateError("");
                    }}
                    placeholder="Enter the email or 10-digit mobile used during registration"
                    autoComplete="email"
                    disabled={!registrationNoFromUrl || verifyingRegistration}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                {registrationGateError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                    {registrationGateError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={verifyRegistration}
                  disabled={
                    !registrationNoFromUrl ||
                    verifyingRegistration
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2563EB] px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.20)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {verifyingRegistration
                    ? "Verifying registration..."
                    : "Verify & continue"}

                  {!verifyingRegistration && (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </button>

                <p className="text-center text-xs leading-5 text-slate-400">
                  We verify your registration directly against TechSkillHub
                  records. Your course cannot be changed after verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const progress =
    ((step + 1) / STEPS.length) * 100;

  return (
    <main className="min-h-screen bg-[#F7F9FC] text-slate-950">
      <PublicHeader />

      <div className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1240px]">
          <header className="mb-8">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#2563EB]">
                  <Sparkles className="h-4 w-4" />
                  TechSkillHub Admissions
                </div>

                <h1 className="max-w-3xl text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl lg:text-[46px] lg:leading-[1.08]">
                  Build the skills that move your career forward.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Complete your application in a few guided steps.
                  Your progress is saved automatically, so you can
                  take your time and come back whenever you're ready.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                  <ShieldCheck className="h-5 w-5 text-[#2563EB]" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Secure application
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Your information is protected
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Application progress
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  Step {String(step + 1).padStart(2, "0")} of{" "}
                  {String(STEPS.length).padStart(2, "0")} ·{" "}
                  {STEPS[step].short}
                </p>
              </div>

              <p className="text-sm font-bold text-[#2563EB]">
                {Math.round(progress)}%
              </p>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-[#2563EB]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
              />
            </div>

            <div className="mt-5 hidden gap-2 lg:grid lg:grid-cols-7">
              {STEPS.map((item, index) => {
                const Icon = item.icon;
                const active = index === step;
                const completed = index < step;

                return (
                  <button
                    key={item.number}
                    type="button"
                    onClick={() => goToStep(index)}
                    disabled={index > step}
                    className={[
                      "group rounded-2xl border p-3 text-left transition",
                      active
                        ? "border-blue-200 bg-blue-50"
                        : completed
                          ? "border-emerald-100 bg-emerald-50/60"
                          : "border-slate-100 bg-slate-50",
                      index > step
                        ? "cursor-default"
                        : "hover:border-slate-200",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={[
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                          active
                            ? "bg-[#2563EB] text-white"
                            : completed
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-white text-slate-400",
                        ].join(" ")}
                      >
                        {completed ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {item.number}
                        </p>

                        <p
                          className={[
                            "truncate text-xs font-semibold",
                            active
                              ? "text-slate-950"
                              : "text-slate-600",
                          ].join(" ")}
                        >
                          {item.short}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {STEPS.map((item, index) => {
                const active = index === step;
                const completed = index < step;

                return (
                  <div
                    key={item.number}
                    className={[
                      "flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold",
                      active
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : completed
                          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-400",
                    ].join(" ")}
                  >
                    {completed ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <span>{item.number}</span>
                    )}

                    {item.short}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
            <section className="min-w-0">
              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
                <div className="border-b border-slate-100 px-5 py-6 sm:px-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB]">
                      {(() => {
                        const Icon = STEPS[step].icon;
                        return <Icon className="h-5 w-5" />;
                      })()}
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2563EB]">
                        {STEPS[step].number} · {STEPS[step].short}
                      </p>

                      <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                        {STEPS[step].title}
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {STEPS[step].description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-7 sm:px-8 sm:py-8">
                  {error && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      <X className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{
                        opacity: 0,
                        x: 12,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -12,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      {step === 0 && (
                        <PersonalStep
                          form={form}
                          updateField={updateField}
                        />
                      )}

                      {step === 1 && (
                        <GuardianStep
                          form={form}
                          updateField={updateField}
                          studentAge={studentAge}
                        />
                      )}

                      {step === 2 && (
                        <AddressStep
                          form={form}
                          updateField={updateField}
                        />
                      )}

                      {step === 3 && (
                        <EducationStep
                          form={form}
                          updateField={updateField}
                        />
                      )}

                      {step === 4 && (
                        <ProgramStep
                          form={form}
                          updateField={updateField}
                          courses={courses}
                          selectedCourse={selectedCourse}
                        />
                      )}

                      {step === 5 && (
                        <FeeStep
                          form={form}
                          updateField={updateField}
                          selectedCourse={selectedCourse}
                          financials={financials}
                        />
                      )}

                      {step === 6 && (
                        <ReviewStep
                          form={form}
                          updateField={updateField}
                          selectedCourse={selectedCourse}
                          financials={financials}
                          onEdit={goToStep}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-8">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={step === 0 || submitting}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>

                  {step < STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.20)] transition hover:bg-blue-700"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submitApplication}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.20)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting
                        ? "Submitting..."
                        : "Submit Application"}

                      {!submitting && (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4 text-slate-400" />
                  Your progress is saved automatically on this device.
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Secure admissions process
                </div>
              </div>
            </section>

            <aside className="h-fit space-y-5 lg:sticky lg:top-5">
              <ApplicationSummary
                selectedCourse={selectedCourse}
                financials={financials}
              />

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <CircleHelp className="h-5 w-5 text-[#2563EB]" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      Need assistance?
                    </p>

                    <p className="text-xs text-slate-500">
                      Our admissions team can help.
                    </p>
                  </div>
                </div>

                <a
                  href="mailto:techskillhubofficial@gmail.com"
                  className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-blue-700"
                >
                  <Mail className="h-4 w-4" />
                  techskillhubofficial@gmail.com
                </a>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} TechSkillHub. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <span>Admissions</span>
            <span>·</span>
            <span>Career-focused learning</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center"
        >
          <Image
            src="/logo/Full-logo.png"
            alt="TechSkillHub"
            width={205}
            height={72}
            priority
            className="h-auto w-[175px] object-contain sm:w-[190px]"
          />
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Secure application
          </div>

          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to website
          </Link>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Steps                                                                      */
/* -------------------------------------------------------------------------- */

function PersonalStep({
  form,
  updateField,
}: {
  form: FormData;
  updateField: <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => void;
}) {
  return (
    <div className="space-y-7">
      <SectionIntro
        eyebrow="Applicant profile"
        title="Let's get to know you"
        description="Start with the details we need to create your applicant profile."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Full name"
          required
          value={form.studentName}
          onChange={(value) =>
            updateField("studentName", value)
          }
          placeholder="Enter your full name"
        />

        <Field
          label="Email address"
          required
          type="email"
          value={form.studentEmail}
          onChange={(value) =>
            updateField("studentEmail", value)
          }
          placeholder="you@example.com"
        />

        <Field
          label="Mobile number"
          required
          value={form.studentPhone}
          onChange={(value) =>
            updateField("studentPhone", value)
          }
          placeholder="10-digit mobile number"
        />

        <Field
          label="Date of birth"
          type="date"
          value={form.dateOfBirth}
          onChange={(value) =>
            updateField("dateOfBirth", value)
          }
        />

        <SelectField
          label="Gender"
          value={form.gender}
          onChange={(value) =>
            updateField("gender", value)
          }
          options={[
            ["", "Select gender"],
            ["MALE", "Male"],
            ["FEMALE", "Female"],
            ["OTHER", "Other"],
            ["PREFER_NOT_TO_SAY", "Prefer not to say"],
          ]}
        />
      </div>

      <InfoNote>
        Please use an email address and mobile number that you actively
        monitor. Our admissions team may use these details for important
        application updates.
      </InfoNote>
    </div>
  );
}

function GuardianStep({
  form,
  updateField,
  studentAge,
}: {
  form: FormData;
  updateField: <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => void;
  studentAge: number | null;
}) {
  return (
    <div className="space-y-7">
      <SectionIntro
        eyebrow="Family & support"
        title="Who should we contact when needed?"
        description="Parent or guardian information helps us communicate clearly throughout the admissions process."
      />

      {studentAge !== null && studentAge < 18 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

            <div>
              <p className="text-sm font-bold text-amber-900">
                Parent/guardian consent required
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-800">
                Because the applicant is under 18, parent/guardian
                confirmation is required as part of the application.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Parent / guardian name"
          required
          value={form.parentName}
          onChange={(value) =>
            updateField("parentName", value)
          }
          placeholder="Full name"
        />

        <SelectField
          label="Relationship"
          required
          value={form.parentRelation}
          onChange={(value) =>
            updateField("parentRelation", value)
          }
          options={[
            ["", "Select relationship"],
            ["FATHER", "Father"],
            ["MOTHER", "Mother"],
            ["GUARDIAN", "Guardian"],
            ["OTHER", "Other"],
          ]}
        />

        <Field
          label="Mobile number"
          required
          value={form.parentPhone}
          onChange={(value) =>
            updateField("parentPhone", value)
          }
          placeholder="10-digit mobile number"
        />

        <Field
          label="Email address"
          type="email"
          value={form.parentEmail}
          onChange={(value) =>
            updateField("parentEmail", value)
          }
          placeholder="Optional"
        />

        <Field
          label="Occupation"
          value={form.parentOccupation}
          onChange={(value) =>
            updateField("parentOccupation", value)
          }
          placeholder="Optional"
        />
      </div>

      {studentAge === null || studentAge >= 18 ? (
        <ConsentBox
          checked={form.parentConsentRequired}
          onChange={(checked) =>
            updateField("parentConsentRequired", checked)
          }
          title="Parent/guardian confirmation"
          description="Select this if you would like us to record parent/guardian confirmation as part of this application."
        />
      ) : null}

      {form.parentConsentRequired && (
        <ConsentBox
          checked={form.parentConsent}
          onChange={(checked) =>
            updateField("parentConsent", checked)
          }
          required
          title="Parent/guardian has reviewed this application"
          description="I confirm that the parent/guardian has reviewed and agreed to this application."
        />
      )}
    </div>
  );
}

function AddressStep({
  form,
  updateField,
}: {
  form: FormData;
  updateField: <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => void;
}) {
  return (
    <div className="space-y-7">
      <SectionIntro
        eyebrow="Residential details"
        title="Where are you based?"
        description="Add your current residential details so we have the right information on your applicant record."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field
            label="Address line 1"
            required
            value={form.addressLine1}
            onChange={(value) =>
              updateField("addressLine1", value)
            }
            placeholder="House / flat / street"
          />
        </div>

        <div className="sm:col-span-2">
          <Field
            label="Address line 2"
            value={form.addressLine2}
            onChange={(value) =>
              updateField("addressLine2", value)
            }
            placeholder="Area / landmark / locality (optional)"
          />
        </div>

        <Field
          label="City"
          required
          value={form.city}
          onChange={(value) =>
            updateField("city", value)
          }
          placeholder="Your city"
        />

        <Field
          label="State"
          required
          value={form.state}
          onChange={(value) =>
            updateField("state", value)
          }
          placeholder="Your state"
        />

        <Field
          label="Postal / PIN code"
          required
          value={form.postalCode}
          onChange={(value) =>
            updateField("postalCode", value)
          }
          placeholder="Postal / PIN code"
        />
      </div>
    </div>
  );
}

function EducationStep({
  form,
  updateField,
}: {
  form: FormData;
  updateField: <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => void;
}) {
  return (
    <div className="space-y-7">
      <SectionIntro
        eyebrow="Education & background"
        title="Tell us about your journey so far"
        description="Your academic and professional background helps our team understand where you're starting from."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Highest education level"
          required
          value={form.educationLevel}
          onChange={(value) =>
            updateField("educationLevel", value)
          }
          options={[
            ["", "Select education level"],
            ["10TH", "10th / Secondary"],
            ["12TH", "12th / Higher Secondary"],
            ["DIPLOMA", "Diploma"],
            ["UNDERGRADUATE", "Undergraduate"],
            ["GRADUATE", "Graduate"],
            ["POSTGRADUATE", "Postgraduate"],
            ["OTHER", "Other"],
          ]}
        />

        <Field
          label="Institution name"
          required
          value={form.institutionName}
          onChange={(value) =>
            updateField("institutionName", value)
          }
          placeholder="School / college / institution"
        />

        <Field
          label="Completion / graduation year"
          type="number"
          value={form.graduationYear}
          onChange={(value) =>
            updateField("graduationYear", value)
          }
          placeholder="e.g. 2026"
        />

        <Field
          label="Current occupation"
          value={form.currentOccupation}
          onChange={(value) =>
            updateField("currentOccupation", value)
          }
          placeholder="Student / working / entrepreneur"
        />

        <div className="sm:col-span-2">
          <TextAreaField
            label="Additional education details"
            value={form.educationDetails}
            onChange={(value) =>
              updateField("educationDetails", value)
            }
            placeholder="Add certifications, relevant subjects, projects or anything else that helps us understand your background."
          />
        </div>
      </div>
    </div>
  );
}

function ProgramStep({
  form,
  updateField,
  courses,
  selectedCourse,
}: {
  form: FormData;
  updateField: <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => void;
  courses: Course[];
  selectedCourse: Course | null;
}) {
  return (
    <div className="space-y-7">
      <SectionIntro
        eyebrow="Program selection"
        title="Choose the path you want to build"
        description="Select the program that best matches your career direction. You can review the fee structure before submitting."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((course) => {
          const selected = form.courseId === course.id;

          return (
            <button
              key={course.id}
              type="button"
              onClick={() => {
                updateField("courseId", course.id);
                updateField("program", course.title);
              }}
              className={[
                "group rounded-3xl border p-5 text-left transition-all duration-200",
                selected
                  ? "border-blue-300 bg-blue-50/70 shadow-[0_10px_30px_rgba(37,99,235,0.10)]"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-[#2563EB] transition group-hover:bg-blue-100">
                  <GraduationCap className="h-5 w-5" />
                </div>

                <div
                  className={[
                    "flex h-6 w-6 items-center justify-center rounded-full border",
                    selected
                      ? "border-[#2563EB] bg-[#2563EB] text-white"
                      : "border-slate-300 bg-white",
                  ].join(" ")}
                >
                  {selected && (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">
                  {course.level} · {course.duration}
                </p>

                <h3 className="mt-2 text-lg font-bold text-slate-950">
                  {course.title}
                </h3>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                  {course.description}
                </p>
              </div>

              <div className="mt-5 flex items-end justify-between border-t border-slate-200/70 pt-4">
                <div>
                  <p className="text-[11px] text-slate-400">
                    Program fee
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-950">
                    {formatINR(course.price)}
                  </p>
                </div>

                <span
                  className={[
                    "text-xs font-semibold",
                    selected
                      ? "text-[#2563EB]"
                      : "text-slate-400",
                  ].join(" ")}
                >
                  {selected ? "Selected" : "Select"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedCourse && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2563EB]">
            Your selection
          </p>

          <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="font-bold text-slate-950">
                {selectedCourse.title}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {selectedCourse.level} · {selectedCourse.duration}
              </p>
            </div>

            <p className="text-lg font-bold text-slate-950">
              {formatINR(selectedCourse.price)}
            </p>
          </div>
        </div>
      )}

      <TextAreaField
        label="Career goal"
        required
        value={form.careerGoal}
        onChange={(value) =>
          updateField("careerGoal", value)
        }
        placeholder="What do you want to learn, build or achieve after completing this program?"
      />
    </div>
  );
}

function FeeStep({
  form,
  updateField,
  selectedCourse,
  financials,
}: {
  form: FormData;
  updateField: <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => void;
  selectedCourse: Course | null;
  financials: Financials;
}) {
  return (
    <div className="space-y-7">
      <SectionIntro
        eyebrow="Financial overview"
        title="Understand your program investment"
        description="Review the complete fee structure before moving to the final application review."
      />

      {selectedCourse && (
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
              Selected program
            </p>

            <p className="mt-1 text-lg font-bold text-slate-950">
              {selectedCourse.title}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs text-slate-400">
              Standard fee
            </p>

            <p className="mt-1 text-xl font-bold text-slate-950">
              {formatINR(financials.standardFee)}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Field
            label="Requested concession"
            type="number"
            value={form.concessionPercent}
            onChange={(value) =>
              updateField("concessionPercent", value)
            }
            placeholder="0"
            min="0"
            max="100"
          />

          <p className="mt-2 text-xs leading-5 text-slate-400">
            If applicable, enter the concession percentage discussed
            with the admissions team. Final concession terms are
            subject to review and approval.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2563EB]">
            Requested concession
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {formatINR(financials.concessionAmount)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {financials.concessionPercent}% of standard fee
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
          <p className="text-sm font-bold text-slate-950">
            Fee breakdown
          </p>

          <p className="mt-1 text-xs text-slate-500">
            A transparent view of the expected payment structure.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          <FeeRow
            label="Standard program fee"
            value={formatINR(financials.standardFee)}
          />

          {financials.concessionAmount > 0 && (
            <FeeRow
              label={`Concession (${financials.concessionPercent}%)`}
              value={`− ${formatINR(
                financials.concessionAmount
              )}`}
              muted
            />
          )}

          <FeeRow
            label="Net program fee"
            value={formatINR(financials.totalFee)}
            strong
          />

          <FeeRow
            label="Registration fee"
            value={formatINR(financials.registrationFee)}
          />

          <FeeRow
            label="First lecture fee"
            value={formatINR(financials.firstLectureFee)}
          />

          <FeeRow
            label="Remaining balance"
            value={formatINR(financials.balanceFee)}
            strong
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PaymentCard
          number="01"
          title="Registration"
          value={formatINR(financials.registrationFee)}
          description="Initial registration amount."
        />

        <PaymentCard
          number="02"
          title="First lecture"
          value={formatINR(financials.firstLectureFee)}
          description="Initial learning-stage payment."
        />

        <PaymentCard
          number="03"
          title="Balance"
          value={formatINR(financials.balanceFee)}
          description="Remaining program fee."
        />
      </div>

      <InfoNote>
        The fee displayed here is an application estimate based on the
        selected program and requested concession. Final fee terms are
        subject to TechSkillHub review and approval.
      </InfoNote>
    </div>
  );
}

function ReviewStep({
  form,
  updateField,
  selectedCourse,
  financials,
  onEdit,
}: {
  form: FormData;
  updateField: <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => void;
  selectedCourse: Course | null;
  financials: Financials;
  onEdit: (index: number) => void;
}) {
  return (
    <div className="space-y-7">
      <SectionIntro
        eyebrow="Final review"
        title="Everything look right?"
        description="Review your application carefully. You can edit any section before submitting it to the TechSkillHub admissions team."
      />

      <div className="space-y-4">
        <ReviewCard
          number="01"
          title="Applicant"
          icon={UserRound}
          onEdit={() => onEdit(0)}
        >
          <ReviewItem
            label="Name"
            value={form.studentName}
          />

          <ReviewItem
            label="Email"
            value={form.studentEmail}
          />

          <ReviewItem
            label="Mobile"
            value={form.studentPhone}
          />

          {form.gender && (
            <ReviewItem
              label="Gender"
              value={formatLabel(form.gender)}
            />
          )}
        </ReviewCard>

        <ReviewCard
          number="02"
          title="Parent / guardian"
          icon={UsersRound}
          onEdit={() => onEdit(1)}
        >
          <ReviewItem
            label="Name"
            value={form.parentName}
          />

          <ReviewItem
            label="Relationship"
            value={formatLabel(form.parentRelation)}
          />

          <ReviewItem
            label="Mobile"
            value={form.parentPhone}
          />
        </ReviewCard>

        <ReviewCard
          number="03"
          title="Address"
          icon={MapPin}
          onEdit={() => onEdit(2)}
        >
          <ReviewItem
            label="Address"
            value={[
              form.addressLine1,
              form.addressLine2,
              form.city,
              form.state,
              form.postalCode,
            ]
              .filter(Boolean)
              .join(", ")}
          />
        </ReviewCard>

        <ReviewCard
          number="04"
          title="Education"
          icon={GraduationCap}
          onEdit={() => onEdit(3)}
        >
          <ReviewItem
            label="Education"
            value={formatLabel(form.educationLevel)}
          />

          <ReviewItem
            label="Institution"
            value={form.institutionName}
          />

          {form.currentOccupation && (
            <ReviewItem
              label="Current status"
              value={form.currentOccupation}
            />
          )}
        </ReviewCard>

        <ReviewCard
          number="05"
          title="Program & career"
          icon={Sparkles}
          onEdit={() => onEdit(4)}
        >
          <ReviewItem
            label="Program"
            value={selectedCourse?.title || form.program}
          />

          <ReviewItem
            label="Career goal"
            value={form.careerGoal}
          />
        </ReviewCard>

        <ReviewCard
          number="06"
          title="Fee plan"
          icon={WalletCards}
          onEdit={() => onEdit(5)}
        >
          <ReviewItem
            label="Program fee"
            value={formatINR(financials.standardFee)}
          />

          <ReviewItem
            label="Concession"
            value={`${financials.concessionPercent}% · ${formatINR(
              financials.concessionAmount
            )}`}
          />

          <ReviewItem
            label="Net fee"
            value={formatINR(financials.totalFee)}
            strong
          />
        </ReviewCard>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-6">
        <div>
          <p className="text-sm font-bold text-slate-950">
            Confirm before submitting
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            These confirmations are recorded with your application.
          </p>
        </div>

        <ConsentBox
          checked={form.declarationAccepted}
          onChange={(checked) =>
            updateField("declarationAccepted", checked)
          }
          required
          title="Applicant declaration"
          description="I confirm that the information provided in this application is accurate and complete to the best of my knowledge."
        />

        <ConsentBox
          checked={form.privacyConsent}
          onChange={(checked) =>
            updateField("privacyConsent", checked)
          }
          required
          title="Privacy & data processing"
          description="I acknowledge that TechSkillHub may process the information provided for admissions, communication and related administrative purposes."
        />

        {form.parentConsentRequired && (
          <ConsentBox
            checked={form.parentConsent}
            onChange={(checked) =>
              updateField("parentConsent", checked)
            }
            required
            title="Parent / guardian confirmation"
            description="I confirm that the parent/guardian has reviewed and agreed to this application."
          />
        )}

        <ConsentBox
          checked={form.marketingConsent}
          onChange={(checked) =>
            updateField("marketingConsent", checked)
          }
          title="Optional communications"
          description="I would like to receive optional educational updates, offers and communications from TechSkillHub."
        />
      </div>

      <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
        <div className="flex gap-3">
          <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />

          <div>
            <p className="text-sm font-bold text-slate-950">
              What happens after submission?
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Your application will enter the TechSkillHub admissions
              review process. Our team will review the information,
              verify the applicable requirements and contact you about
              the next step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

function ApplicationSummary({
  selectedCourse,
  financials,
}: {
  selectedCourse: Course | null;
  financials: Financials;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-slate-950 p-6 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">
          Application summary
        </p>

        <h2 className="mt-2 text-xl font-bold">
          {selectedCourse?.title || "Select your program"}
        </h2>

        {selectedCourse && (
          <p className="mt-1 text-xs text-slate-400">
            {selectedCourse.level} · {selectedCourse.duration}
          </p>
        )}
      </div>

      <div className="p-6">
        {selectedCourse ? (
          <>
            <div className="space-y-1">
              <p className="text-xs text-slate-400">
                Program fee
              </p>

              <p className="text-3xl font-bold tracking-tight text-slate-950">
                {formatINR(financials.totalFee)}
              </p>

              {financials.concessionAmount > 0 && (
                <p className="text-xs text-emerald-600">
                  {financials.concessionPercent}% concession applied
                </p>
              )}
            </div>

            <div className="my-6 h-px bg-slate-100" />

            <div className="space-y-1">
              <SummaryRow
                label="Registration"
                value={formatINR(
                  financials.registrationFee
                )}
              />

              <SummaryRow
                label="First lecture"
                value={formatINR(
                  financials.firstLectureFee
                )}
              />

              <SummaryRow
                label="Balance"
                value={formatINR(financials.balanceFee)}
              />
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-900">
                Fee transparency
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Your application records the requested fee structure.
                Final approved terms are confirmed by the admissions
                team.
              </p>
            </div>
          </>
        ) : (
          <div className="py-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <GraduationCap className="h-5 w-5 text-slate-400" />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-900">
              Your selected program will appear here.
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Choose a program to see the corresponding fee structure.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable components                                                        */
/* -------------------------------------------------------------------------- */

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2563EB]">
        {eyebrow}
      </p>

      <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
        {title}
      </h3>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        min={min}
        max={max}
        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={5}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function ConsentBox({
  checked,
  onChange,
  title,
  description,
  required = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
  required?: boolean;
}) {
  return (
    <label
      className={[
        "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition",
        checked
          ? "border-blue-200 bg-blue-50/50"
          : "border-slate-200 bg-white hover:border-slate-300",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-blue-200"
      />

      <span>
        <span className="block text-sm font-bold text-slate-900">
          {title}
          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </span>

        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>
    </label>
  );
}

function InfoNote({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

      <p className="text-xs leading-5 text-slate-500">
        {children}
      </p>
    </div>
  );
}

function FeeRow({
  label,
  value,
  strong = false,
  muted = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <span
        className={[
          "text-sm",
          strong
            ? "font-bold text-slate-950"
            : muted
              ? "text-slate-400"
              : "text-slate-600",
        ].join(" ")}
      >
        {label}
      </span>

      <span
        className={[
          "text-sm",
          strong
            ? "font-bold text-slate-950"
            : muted
              ? "font-medium text-slate-400"
              : "font-semibold text-slate-800",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function PaymentCard({
  number,
  title,
  value,
  description,
}: {
  number: string;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
        {number}
      </p>

      <p className="mt-2 text-sm font-bold text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[11px] leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function ReviewCard({
  number,
  title,
  icon: Icon,
  onEdit,
  children,
}: {
  number: string;
  title: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[#2563EB]">
            <Icon className="h-4 w-4" />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {number}
            </p>

            <p className="text-sm font-bold text-slate-950">
              {title}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-bold text-[#2563EB] hover:text-blue-700"
        >
          Edit
        </button>
      </div>

      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

function ReviewItem({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p
        className={[
          "mt-1 break-words text-sm",
          strong
            ? "font-bold text-slate-950"
            : "font-medium text-slate-700",
        ].join(" ")}
      >
        {value || "Not provided"}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-xs font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Success / loading                                                          */
/* -------------------------------------------------------------------------- */

function SuccessScreen({
  applicationNo,
  financials,
}: {
  applicationNo: string;
  financials: Financials;
}) {
  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <PublicHeader />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
          className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
        >
          <div className="bg-slate-950 px-6 py-10 text-center text-white sm:px-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
              Application received
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Your TechSkillHub journey starts here.
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300">
              Your application has been successfully submitted to
              the TechSkillHub admissions team.
            </p>
          </div>

          <div className="px-6 py-8 sm:px-12 sm:py-10">
            <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2563EB]">
                Application reference
              </p>

              <p className="mt-2 text-2xl font-bold tracking-[0.06em] text-slate-950 sm:text-3xl">
                {applicationNo}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Keep this reference for future communication with
                our admissions team.
              </p>
            </div>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Financial snapshot
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FinancialSnapshot
                  label="Program fee"
                  value={formatINR(
                    financials.totalFee
                  )}
                />

                <FinancialSnapshot
                  label="Registration"
                  value={formatINR(
                    financials.registrationFee
                  )}
                />

                <FinancialSnapshot
                  label="First lecture"
                  value={formatINR(
                    financials.firstLectureFee
                  )}
                />

                <FinancialSnapshot
                  label="Balance"
                  value={formatINR(
                    financials.balanceFee
                  )}
                />
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    What happens next?
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Our admissions team will review your application
                    and contact you regarding the next stage. The
                    submitted application and financial snapshot are
                    subject to the admissions review process.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Back to TechSkillHub
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="mailto:techskillhubofficial@gmail.com"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Mail className="h-4 w-4" />
                Contact admissions
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function FinancialSnapshot({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <PublicHeader />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-5 w-48 rounded bg-slate-200" />
          <div className="mt-4 h-12 w-3/4 rounded bg-slate-200" />
          <div className="mt-3 h-5 w-1/2 rounded bg-slate-100" />

          <div className="mt-8 h-24 rounded-3xl bg-white" />

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_350px]">
            <div className="h-[600px] rounded-[28px] bg-white" />
            <div className="h-[360px] rounded-3xl bg-white" />
          </div>
        </div>
      </div>
    </main>
  );
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}


export default function ApplyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50" aria-busy="true" />
      }
    >
      <ApplyPageContent />
    </Suspense>
  );
}
