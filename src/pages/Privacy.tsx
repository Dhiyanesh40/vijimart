import Layout from "@/components/layout/Layout";

const Privacy = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-display font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly — such as your name, email address, phone
              number, and delivery address when you create an account or place an order. We also collect
              usage data (pages visited, items viewed) to improve your shopping experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information is used to process orders, send order confirmations and delivery updates,
              respond to support requests, and personalise your shopping experience. We do not sell your
              personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We share your data only with service providers who help us operate the platform — such as
              payment processors (Razorpay) and delivery partners — strictly for the purpose of
              fulfilling your orders.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and local storage to keep you logged in and remember your cart. You can
              disable cookies in your browser settings, but some features of the site may not function
              correctly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including HTTPS encryption and hashed
              passwords. However, no method of transmission over the internet is 100% secure, and we
              cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access, correct, or delete your personal data. To exercise these
              rights, contact us at the email below. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes by posting the new policy on this page with an updated date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:info@srivijiyalaxmi.com" className="text-primary underline hover:text-primary/80">
                info@srivijiyalaxmi.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
