import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Deke Sharon',
  description: 'Terms of service for dekesharon.com',
}

export default function TermsPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <p className="text-muted-foreground mb-4">Last updated: March 9, 2026</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Services</h2>
          <p>
            Deke Sharon offers a cappella arrangements, vocal coaching (individual and group),
            workshops, masterclasses, speaking engagements, and consulting services. All services
            are subject to availability and mutual agreement on terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Bookings &amp; Payments</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Bookings are confirmed upon receipt of a signed agreement and deposit (if applicable).</li>
            <li>Payment terms, cancellation policies, and refund conditions are specified in each booking agreement.</li>
            <li>Late payments may incur additional fees as outlined in the agreement.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Arrangements</h2>
          <p>
            Custom arrangements are licensed for use by the purchasing organization. Redistribution,
            resale, or public sharing of arrangements without written permission is prohibited.
            Revision policies are specified at the time of purchase.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Intellectual Property</h2>
          <p>
            All content on this website — including text, images, audio, video, and arrangements —
            is the property of Deke Sharon or used with permission. Unauthorized reproduction is
            prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Limitation of Liability</h2>
          <p>
            Services are provided &ldquo;as is.&rdquo; We are not liable for indirect, incidental,
            or consequential damages arising from the use of our website or services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of our website or services
            after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
          <p>
            Questions? Reach out via our{' '}
            <a href="/contact" className="text-primary underline">contact page</a>.
          </p>
        </section>
      </div>
    </main>
  )
}
