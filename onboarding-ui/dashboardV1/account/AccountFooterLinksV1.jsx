import React from "react";

function FooterLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-medium text-white/52 transition active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

export default function AccountFooterLinksV1({
  onHelp,
  onPrivacy,
  onTerms,
}) {
  return (
    <div className="border-t border-white/8 px-4 py-4">
      <div className="flex items-center justify-center gap-5">
        <FooterLink onClick={onHelp}>Help</FooterLink>
        <FooterLink onClick={onPrivacy}>Privacy</FooterLink>
        <FooterLink onClick={onTerms}>Terms</FooterLink>
      </div>
    </div>
  );
}