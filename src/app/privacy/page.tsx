import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Deke Sharon',
  description: 'Privacy policy for dekesharon.com',
}

export default function PrivacyPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">Last updated: March 9, 2026</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Information We Collect</h2>
          <p>
            When you use our website, submit a contact form, book a service, or sign up for our
            newsletter, we may collect your name, email address, phone number, organization name,
            and location. We also collect standard web analytics data (page views, browser type)
            to improve our site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To respond to inquiries and booking requests</li>
            <li>To send newsletters and updates you have opted into</li>
            <li>To improve our website and services</li>
            <li>To process payments for arrangements, workshops, and coaching</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Data Sharing</h2>
          <p>
            We do not sell or rent your personal information to third parties. We may share data
            with service providers (email delivery, payment processing) solely to operate our
            business.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Cookies</h2>
          <p>
            We use essential cookies for site functionality and analytics cookies to understand
            how visitors use our site. You can disable cookies in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data at any
            time by contacting us. To unsubscribe from emails, use the unsubscribe link in any
            email or contact us directly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
          <p>
            Questions about this policy? Reach out via our{' '}
            <a href="/contact" className="text-primary underline">contact page</a>.
          </p>
        </section>
      </div>
    </main>
  )
}
