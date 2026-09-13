import React from 'react';
import { FlameKindling } from 'lucide-react';
import Wordmark from '../components/Wordmark';

interface StatusPageProps {
  code: string;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  isArabic: boolean;
}

export const StatusPage: React.FC<StatusPageProps> = ({ code, titleEn, titleAr, messageEn, messageAr, isArabic }) => {
  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#0D1929] text-[#E2E6E8] flex flex-col items-center justify-center px-6 font-body text-center space-y-8"
    >
      <Wordmark size="md" />

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-3 text-[#D8A065]">
          <FlameKindling className="w-6 h-6" />
          <span className="font-heading text-5xl tracking-widest">{code}</span>
          <FlameKindling className="w-6 h-6 scale-x-[-1]" />
        </div>
        <h1 className="font-heading text-xl uppercase tracking-wide text-[#E2E6E8]">
          {isArabic ? titleAr : titleEn}
        </h1>
        <p className="text-sm text-[#E2E6E8]/60 max-w-md mx-auto leading-relaxed">
          {isArabic ? messageAr : messageEn}
        </p>
      </div>

      <a
        href="/"
        className="btn-lahab-primary px-8 py-3 text-xs font-bold uppercase tracking-wider inline-block"
      >
        {isArabic ? 'العودة للموقع الرئيسي' : 'Back to LΛHΛB'}
      </a>
    </div>
  );
};

export const NotFoundPage: React.FC<{ isArabic?: boolean }> = ({ isArabic = false }) => (
  <StatusPage
    code="404"
    titleEn="This page has been archived or never existed."
    titleAr="الصفحة دي مش موجودة أو اتشالت."
    messageEn="The link you followed may be outdated, or the piece you're looking for is no longer part of the collection."
    messageAr="اللينك اللي دخلت بيه ممكن يكون قديم، أو القطعة اللي بتدور عليها بقت مش موجودة في المجموعة."
    isArabic={isArabic}
  />
);

export const ForbiddenPage: React.FC<{ isArabic?: boolean }> = ({ isArabic = false }) => (
  <StatusPage
    code="403"
    titleEn="You don't have access to this."
    titleAr="مفيش صلاحية إنك توصل للصفحة دي."
    messageEn="Your session doesn't have permission to view this page. If you believe this is a mistake, sign in again."
    messageAr="الجلسة بتاعتك مش معاها صلاحية تدخل الصفحة دي. لو الموضوع غلط، سجّل دخولك تاني."
    isArabic={isArabic}
  />
);

export default StatusPage;
