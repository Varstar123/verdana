import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  GlobeIcon,
  UsersIcon,
  SatelliteIcon,
  SparkIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "For Business",
  description:
    "Branded forests, ESG-ready dashboards, employee gifting, and a partner API for corporate reforestation programs.",
};

const features = [
  {
    icon: GlobeIcon,
    title: "Branded forests",
    body: "Sponsor a named grove and give every stakeholder a live link to your collective impact.",
  },
  {
    icon: ShieldCheckIcon,
    title: "ESG-ready reporting",
    body: "Export auditable, GPS-backed impact reports (PDF/CSV) aligned to your sustainability disclosures.",
  },
  {
    icon: UsersIcon,
    title: "Employee & customer gifting",
    body: "Distribute tree credits via codes or our API. Run internal green challenges with live leaderboards.",
  },
  {
    icon: SatelliteIcon,
    title: "Verified monitoring",
    body: "Satellite and field verification so your claims survive scrutiny — no greenwashing risk.",
  },
];

const tiers = [
  {
    name: "Starter",
    price: "$2,500",
    cadence: "/ year",
    trees: "Up to 1,000 trees",
    perks: ["Branded forest page", "Quarterly impact report", "Email support"],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$25,000",
    cadence: "/ year",
    trees: "Up to 15,000 trees",
    perks: [
      "Everything in Starter",
      "ESG dashboard + CSV export",
      "Employee gifting portal",
      "Dedicated partner manager",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    trees: "Unlimited + carbon credits",
    perks: [
      "Everything in Growth",
      "Partner API & SSO",
      "Verra/Gold Standard credits",
      "White-label gifting",
    ],
    highlighted: false,
  },
];

export default function CorporatePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-forest-gradient leaf-grain">
        <div className="container-px grid gap-10 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-sage ring-1 ring-inset ring-white/20">
              <SparkIcon className="h-4 w-4" />
              Verdana for Business
            </span>
            <h1 className="mt-6 text-4xl leading-tight text-white sm:text-5xl">
              Turn climate commitments into verifiable impact
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              From CSR campaigns to net-zero roadmaps — fund real reforestation,
              engage your people, and report impact you can actually defend.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#contact"
                className="btn-primary bg-white text-forest-700 hover:bg-ivory"
              >
                Talk to our team
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="#pricing"
                className="btn border border-white/30 text-white hover:bg-white/10"
              >
                See packages
              </Link>
            </div>
          </div>

          {/* Mock dashboard preview */}
          <div className="rounded-3xl bg-white/95 p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-forest-900/50">
              Impact dashboard · Acme Corp
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                ["48,210", "Trees"],
                ["1,012 t", "CO₂"],
                ["6", "Countries"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-xl bg-ivory p-3 text-center">
                  <p className="font-serif text-xl text-forest-900">{v}</p>
                  <p className="text-[11px] uppercase tracking-wide text-forest-900/50">
                    {l}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2.5">
              {[
                ["Amazon Headwaters", 72],
                ["Great Rift Highlands", 54],
                ["Borneo Lowland Peat", 31],
              ].map(([name, pct]) => (
                <div key={name as string}>
                  <div className="flex justify-between text-xs text-forest-900/60">
                    <span>{name}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-forest-100">
                    <div
                      className="h-full rounded-full bg-forest-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-px py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest-50 text-forest-600">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg text-forest-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-900/60">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-sage-gradient py-20">
        <div className="container-px">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Packages</p>
            <h2 className="mt-3 text-4xl text-forest-900">
              Programs that scale with your ambition
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col rounded-3xl p-7 ${
                  tier.highlighted
                    ? "bg-forest-gradient text-white shadow-soft ring-2 ring-forest-600"
                    : "card"
                }`}
              >
                {tier.highlighted && (
                  <span className="mb-3 inline-flex w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                    Most popular
                  </span>
                )}
                <h3
                  className={`text-xl ${tier.highlighted ? "text-white" : "text-forest-900"}`}
                >
                  {tier.name}
                </h3>
                <p className="mt-3">
                  <span
                    className={`font-serif text-4xl ${tier.highlighted ? "text-white" : "text-forest-900"}`}
                  >
                    {tier.price}
                  </span>
                  <span
                    className={
                      tier.highlighted ? "text-white/70" : "text-forest-900/50"
                    }
                  >
                    {" "}
                    {tier.cadence}
                  </span>
                </p>
                <p
                  className={`mt-1 text-sm ${tier.highlighted ? "text-white/80" : "text-forest-900/60"}`}
                >
                  {tier.trees}
                </p>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <ShieldCheckIcon
                        className={`mt-0.5 h-4 w-4 shrink-0 ${tier.highlighted ? "text-sage" : "text-forest-500"}`}
                      />
                      <span
                        className={
                          tier.highlighted ? "text-white/90" : "text-forest-900/70"
                        }
                      >
                        {perk}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="#contact"
                  className={`mt-7 ${
                    tier.highlighted
                      ? "btn-primary bg-white text-forest-700 hover:bg-ivory"
                      : "btn-secondary"
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="container-px py-20">
        <div className="card mx-auto max-w-2xl p-8 sm:p-10">
          <h2 className="text-3xl text-forest-900">Let&apos;s build your forest</h2>
          <p className="mt-2 text-forest-900/60">
            Tell us about your goals and we&apos;ll put together a proposal. (Demo
            form — submissions aren&apos;t stored.)
          </p>
          <form className="mt-7 grid gap-4 sm:grid-cols-2">
            <input
              className="rounded-xl border border-forest-100 bg-white px-4 py-3 text-sm outline-none focus:border-forest-300 focus:ring-2 focus:ring-forest-100"
              placeholder="Full name"
            />
            <input
              className="rounded-xl border border-forest-100 bg-white px-4 py-3 text-sm outline-none focus:border-forest-300 focus:ring-2 focus:ring-forest-100"
              placeholder="Work email"
            />
            <input
              className="rounded-xl border border-forest-100 bg-white px-4 py-3 text-sm outline-none focus:border-forest-300 focus:ring-2 focus:ring-forest-100 sm:col-span-2"
              placeholder="Company"
            />
            <textarea
              rows={4}
              className="rounded-xl border border-forest-100 bg-white px-4 py-3 text-sm outline-none focus:border-forest-300 focus:ring-2 focus:ring-forest-100 sm:col-span-2"
              placeholder="What would you like to achieve?"
            />
            <button type="button" className="btn-primary sm:col-span-2">
              Request a proposal
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
