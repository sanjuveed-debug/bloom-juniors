import React from 'react'

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#fff8ec] px-5 py-8 text-slate-800">
      <div className="mx-auto max-w-3xl rounded-[28px] bg-white p-6 shadow-xl md:p-8">
        <a href="/" className="font-round text-sm font-bold text-purple-700">
          Back to app
        </a>

        <h1 className="mt-5 font-bubble text-4xl text-[#2d0a5e]">
          Privacy Policy
        </h1>
        <p className="mt-2 font-round text-sm font-bold text-slate-500">
          Last updated: 1 June 2026
        </p>

        <section className="mt-6 space-y-4 font-round text-base leading-7">
          <p>
            Bloom Juniors is a child-focused learning app for ages 3-9. A parent or
            guardian must register before a child can use the app.
          </p>

          <h2 className="font-bubble text-2xl text-[#2d0a5e]">Information We Collect</h2>
          <p>
            We collect parent or guardian contact details, child profile names, age range,
            learning progress, stars, streaks, activity completion, and basic device/session
            information needed to run and improve the app.
          </p>

          <h2 className="font-bubble text-2xl text-[#2d0a5e]">How We Use Information</h2>
          <p>
            We use this information to save progress, show age-appropriate activities,
            support parent access, improve the learning experience, and respond to support
            requests.
          </p>

          <h2 className="font-bubble text-2xl text-[#2d0a5e]">Children's Privacy</h2>
          <p>
            Children do not create public profiles, send messages, or use open chat. Parent
            or guardian consent is required before use. We do not sell children's personal
            information.
          </p>

          <h2 className="font-bubble text-2xl text-[#2d0a5e]">Cloud Storage</h2>
          <p>
            Account and progress data may be stored with Supabase so learning progress can
            sync across devices. Some progress may also be saved locally on the device for
            offline or PIN-only use.
          </p>

          <h2 className="font-bubble text-2xl text-[#2d0a5e]">Your Choices</h2>
          <p>
            A parent or guardian can request deletion of account or child progress data by
            contacting support. We will process deletion requests within 30 days.
          </p>

          <h2 className="font-bubble text-2xl text-[#2d0a5e]">UAE Data Protection</h2>
          <p>
            For users in the United Arab Emirates, we comply with Federal Decree-Law No. 45 of
            2021 on Personal Data Protection (UAE PDPL). Processing of a child's personal data
            requires consent from a parent or guardian. You may request access to, correction
            of, or deletion of personal data at any time by contacting us.
          </p>

          <h2 className="font-bubble text-2xl text-[#2d0a5e]">Contact</h2>
          <p>
            For privacy or support requests, contact: <a className="font-bold text-purple-700" href="mailto:support@bloomjuniors.com">support@bloomjuniors.com</a>
          </p>
        </section>
      </div>
    </main>
  )
}
