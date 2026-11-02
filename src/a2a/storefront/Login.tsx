import { Eye, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { copy } from "../../copy/copy";
import { Footer, Header } from "./parts";
import { demoTimeout } from "../demoClock";

const t = copy.a2a.storefront;
const l = t.login;

/** How long after the page appears AutoFill fills it in, and how long logging in takes, in ms. */
const AUTOFILL = 600;
const SIGN_IN = 1200;

/**
 * Login — Fizz Partners' login page. It appears empty, then iOS AutoFill puts
 * in John's saved email and password a moment later (the fields take Safari's
 * pale yellow AutoFill tint); tapping a field before then fills them too.
 * Then Log in turns to a spinner, and a moment later John is logged in.
 */
export function Login({ onSignedIn }: { onSignedIn: () => void }) {
  const [filled, setFilled] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const fill = () => setFilled(true);
  useEffect(() => {
    return demoTimeout(fill, AUTOFILL);
  }, []);
  useEffect(() => {
    if (!signingIn) return;
    return demoTimeout(onSignedIn, SIGN_IN);
  }, [signingIn, onSignedIn]);

  return (
    <div className="sf-page isolate flex min-h-full flex-col">
      <Header />
      <section className="px-4 pt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (filled) setSigningIn(true);
          }}
          className="flex flex-col rounded-[24px] border border-[#e4e4e7] bg-white px-6 pb-8 pt-9"
        >
          <h1 className="text-[32px] font-bold leading-[1.04] tracking-[-0.025em] text-text">
            {l.title}
          </h1>
          <p className="mt-1.5 text-[16px] text-text-muted">{l.subtitle}</p>

          <Field
            label={l.email}
            type="email"
            value={filled ? l.autofill.email : ""}
            placeholder={l.emailPlaceholder}
            filled={filled}
            onTap={fill}
            className="mt-7"
          />
          <Field
            label={l.password}
            type="password"
            value={filled ? l.autofill.password : ""}
            filled={filled}
            onTap={fill}
            className="mt-4"
            trailing={
              <span aria-label={l.showPassword} className="grid size-10 place-items-center text-text-muted">
                <Eye className="size-5" strokeWidth={2} />
              </span>
            }
          />
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="mt-3 self-start text-[14px] font-semibold text-text underline underline-offset-4"
          >
            {l.forgot}
          </a>

          <button
            type="submit"
            aria-busy={signingIn}
            className={`sf-btn sf-btn-dark mt-7 w-full gap-2 ${filled ? "" : "opacity-40"}`}
          >
            {signingIn ? (
              <>
                <LoaderCircle className="size-5 animate-spin" strokeWidth={2.5} />
                {l.signingIn}
              </>
            ) : (
              l.submit
            )}
          </button>

          <div className="mt-8 h-px bg-black/[0.08]" aria-hidden />
          <p className="mt-6 text-center text-[14px] text-text-muted">{l.newHere}</p>
          <button type="button" className="sf-btn sf-btn-outline mt-3 w-full">
            {t.cta.request}
          </button>
        </form>
      </section>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

/** A labelled field, 52px tall, with a hairline. Tapping it asks AutoFill to fill in. */
function Field({
  label,
  type,
  value,
  placeholder,
  filled,
  onTap,
  trailing,
  className = "",
}: {
  label: string;
  type: "email" | "password";
  value: string;
  placeholder?: string;
  filled: boolean;
  onTap: () => void;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[14px] font-semibold text-text">{label}</span>
      <span className={`sf-field ${filled ? "sf-field-autofilled" : ""}`}>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          readOnly
          onFocus={onTap}
          onClick={onTap}
          className="h-full min-w-0 flex-1 bg-transparent px-4 text-[16px] text-text outline-none placeholder:text-text-subtle"
        />
        {trailing}
      </span>
    </label>
  );
}
