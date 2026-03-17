import Layout from "@/components/layout/Layout";

const Terms = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-display font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using the Sri Vijiyalaxmi Super Mart website and services, you agree to be
              bound by these Terms of Service. If you do not agree to these terms, please do not use our
              services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Use of Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may use our services only for lawful purposes and in accordance with these Terms. You
              agree not to use the services in any way that violates applicable local, national, or
              international laws or regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Account Responsibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for
              all activities that occur under your account. Notify us immediately of any unauthorised use
              of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Orders & Payments</h2>
            <p className="text-muted-foreground leading-relaxed">
              All orders are subject to product availability and confirmation of the order price. We
              reserve the right to refuse or cancel any order for any reason, including errors in product
              or pricing information. Payments are processed securely via Razorpay.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Returns & Refunds</h2>
            <p className="text-muted-foreground leading-relaxed">
              Perishable items cannot be returned. For non-perishable items, please contact us within
              48 hours of delivery if there is an issue. Approved refunds will be credited to your
              original payment method within 5–7 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, Sri Vijiyalaxmi Super Mart shall not be liable for
              any indirect, incidental, special, or consequential damages arising from your use of our
              services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. Continued use of the service after
              changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any questions about these Terms, please contact us at{" "}
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

export default Terms;
