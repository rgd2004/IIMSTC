import React from "react";
import "./TermsPage.css";

const TermsPage = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <div className="terms-header">
          <h1 className="terms-title">Terms & Conditions</h1>
          <p className="terms-subtitle">
            Please read these terms carefully before using our services
          </p>
          <p className="last-updated">Last Updated: December 15, 2025</p>
        </div>

        <div className="terms-content">
          <div className="terms-grid">
            
            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">🚫</div>
                <h3>No Refund Policy</h3>
              </div>
              <p>
                All services provided by PKC CAG are digital and non-returnable.
                Once an order is placed and processing is started, no refund can be issued under any circumstance.
              </p>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">🚚</div>
                <h3>Service Delivery</h3>
              </div>
              <p>
                Delivery time varies depending on the service. Estimated delivery time is mentioned on the service page.
              </p>
              <ul className="terms-list">
                <li>Standard delivery: 3-7 business days</li>
                <li>Rush delivery available for select services</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">👤</div>
                <h3>Customer Responsibility</h3>
              </div>
              <p>
                Customers must provide correct details such as links, business information, and custom text. Incorrect details may delay order processing.
              </p>
              <ul className="terms-list">
                <li>Verify all information before submission</li>
                <li>Ensure links and URLs are functional</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">🔒</div>
                <h3>Privacy & Data Protection</h3>
              </div>
              <p>
                We respect your privacy and protect your personal information.
              </p>
              <ul className="terms-list">
                <li>Data stored securely and used only for service delivery</li>
                <li>No sharing with third parties without consent</li>
                <li>Right to request data deletion anytime</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">⚖️</div>
                <h3>Intellectual Property</h3>
              </div>
              <p>
                All deliverables remain PKC CAG property until full payment is received.
              </p>
              <ul className="terms-list">
                <li>Full rights transferred upon payment</li>
                <li>We may showcase work in portfolio</li>
                <li>No reselling or redistribution allowed</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">✏️</div>
                <h3>Revisions & Modifications</h3>
              </div>
              <p>
                Limited revisions offered as specified in each package.
              </p>
              <ul className="terms-list">
                <li>Revisions within 7 days of delivery</li>
                <li>Extra revisions may incur charges</li>
                <li>Major changes are new orders</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">⚠️</div>
                <h3>Limitation of Liability</h3>
              </div>
              <p>
                PKC CAG not liable for indirect or consequential damages.
              </p>
              <ul className="terms-list">
                <li>Not responsible for improper use</li>
                <li>Max liability limited to service amount</li>
                <li>Force majeure events excluded</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">🔄</div>
                <h3>Order Cancellation</h3>
              </div>
              <p>
                Orders cancelled only before work commences.
              </p>
              <ul className="terms-list">
                <li>Cancel within 24 hours of placement</li>
                <li>No cancellation after processing starts</li>
                <li>No partial refunds available</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">💳</div>
                <h3>Payment Terms</h3>
              </div>
              <p>
                Payment required before service delivery unless agreed otherwise.
              </p>
              <ul className="terms-list">
                <li>Multiple payment methods accepted</li>
                <li>Prices in specified currency</li>
                <li>Payment issues may cause delays</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">📝</div>
                <h3>Acceptable Use Policy</h3>
              </div>
              <p>
                Services not for illegal, harmful, or unethical purposes.
              </p>
              <ul className="terms-list">
                <li>No violent or discriminatory content</li>
                <li>We reserve right to refuse service</li>
                <li>Violations result in termination</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">⏱️</div>
                <h3>Service Guarantee</h3>
              </div>
              <p>
                We guarantee quality service delivery within agreed timeframe.
              </p>
              <ul className="terms-list">
                <li>Meet industry quality standards</li>
                <li>Timely delivery as per agreement</li>
                <li>Professional support throughout</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">🌐</div>
                <h3>Third-Party Services</h3>
              </div>
              <p>
                We may use third-party tools and services for order fulfillment.
              </p>
              <ul className="terms-list">
                <li>Trusted vendors and platforms</li>
                <li>Your data handled per our privacy policy</li>
                <li>Not liable for third-party failures</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">📧</div>
                <h3>Communication Policy</h3>
              </div>
              <p>
                All official communication via registered email or WhatsApp.
              </p>
              <ul className="terms-list">
                <li>Check spam folders regularly</li>
                <li>Respond to queries within 48 hours</li>
                <li>Keep communication professional</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">🎯</div>
                <h3>Service Scope</h3>
              </div>
              <p>
                Services delivered as per package description and agreement.
              </p>
              <ul className="terms-list">
                <li>No additional features without agreement</li>
                <li>Scope changes require new contract</li>
                <li>Custom requests quoted separately</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">🔐</div>
                <h3>Account Security</h3>
              </div>
              <p>
                Customers responsible for maintaining account security.
              </p>
              <ul className="terms-list">
                <li>Keep login credentials confidential</li>
                <li>Report unauthorized access immediately</li>
                <li>We're not liable for account breaches</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">📄</div>
                <h3>Documentation & Files</h3>
              </div>
              <p>
                All source files and documentation provided as per package.
              </p>
              <ul className="terms-list">
                <li>Download files within 30 days</li>
                <li>Backup responsibility is yours</li>
                <li>Re-delivery may incur charges</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">⚡</div>
                <h3>Rush Orders</h3>
              </div>
              <p>
                Expedited delivery available with additional charges.
              </p>
              <ul className="terms-list">
                <li>Rush fee applied based on urgency</li>
                <li>Subject to availability and feasibility</li>
                <li>Quality standards maintained</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">🛡️</div>
                <h3>Warranty & Support</h3>
              </div>
              <p>
                Technical support provided for 30 days post-delivery.
              </p>
              <ul className="terms-list">
                <li>Bug fixes within warranty period</li>
                <li>Extended support available separately</li>
                <li>Covers technical issues only</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">🔔</div>
                <h3>Changes to Terms</h3>
              </div>
              <p>
                PKC CAG reserves right to modify terms anytime.
              </p>
              <ul className="terms-list">
                <li>Updates posted with revised date</li>
                <li>Continued use means acceptance</li>
                <li>Major changes communicated via email</li>
              </ul>
            </section>

            <section className="terms-section">
              <div className="section-header">
                <div className="section-icon">⚖️</div>
                <h3>Dispute Resolution</h3>
              </div>
              <p>
                Disputes resolved through mutual discussion and arbitration.
              </p>
              <ul className="terms-list">
                <li>Contact support first for resolution</li>
                <li>Good faith negotiation required</li>
                <li>Local jurisdiction applies</li>
              </ul>
            </section>

            <section className="terms-section highlight-section">
              <div className="section-header">
                <div className="section-icon">💬</div>
                <h3>Contact & Support</h3>
              </div>
              <p>
                For any help, you can contact us on WhatsApp or Email anytime.
              </p>
              <div className="contact-info">
                <p>📞 Response within 24 hours on business days</p>
                <p>💬 WhatsApp for urgent matters</p>
              </div>
            </section>

          </div>

          <div className="terms-footer">
            <p>
              By using our services, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms & Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
