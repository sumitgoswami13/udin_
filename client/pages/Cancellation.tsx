import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FileText, XCircle } from "lucide-react";

export default function Cancellation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">UDIN</span>
            </div>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                <XCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">Cancellation Policy</CardTitle>
              <CardDescription>
                Last updated: {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Overview
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    At UDIN, we understand that circumstances may change and you
                    may need to cancel your professional service request. This
                    Cancellation Policy outlines the terms and conditions for
                    cancelling services and requesting refunds.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Cancellation Timeframes
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Before Work Commences
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        You may cancel your service request at any time before
                        our chartered accountants begin working on your
                        documents.
                      </p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>Full refund of all charges paid</li>
                        <li>No cancellation fees applied</li>
                        <li>Cancellation processed within 24 hours</li>
                        <li>Refund credited within 5-7 business days</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        After Work Commences
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        Once our team has started processing your documents,
                        different cancellation terms apply based on the
                        completion status:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>
                          <strong>0-25% Complete:</strong> 75% refund of service
                          charges
                        </li>
                        <li>
                          <strong>26-50% Complete:</strong> 50% refund of
                          service charges
                        </li>
                        <li>
                          <strong>51-75% Complete:</strong> 25% refund of
                          service charges
                        </li>
                        <li>
                          <strong>76-100% Complete:</strong> No refund available
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    UDIN Services Cancellation
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    For services requiring UDIN (Unique Document Identification
                    Number), special cancellation terms apply:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>
                      UDIN cannot be cancelled once the number is generated and
                      assigned
                    </li>
                    <li>
                      If UDIN is issued, the service is considered completed for
                      cancellation purposes
                    </li>
                    <li>
                      Cancellation before UDIN generation follows standard
                      timeframe rules
                    </li>
                    <li>
                      UDIN-related regulatory compliance work cannot be
                      cancelled once submitted to authorities
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    How to Cancel
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    To cancel your service request, please follow these steps:
                  </p>
                  <ol className="list-decimal list-inside text-gray-700 space-y-2">
                    <li>
                      Contact our support team immediately via email or phone
                    </li>
                    <li>
                      Provide your order number and reason for cancellation
                    </li>
                    <li>
                      Submit cancellation request in writing (email is
                      acceptable)
                    </li>
                    <li>
                      Await confirmation of cancellation and refund details
                    </li>
                    <li>Return any physical documents if applicable</li>
                  </ol>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Non-Cancellable Services
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Certain services cannot be cancelled once initiated due to
                    their nature and regulatory requirements:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Statutory audit reports once filed with authorities</li>
                    <li>Tax returns once submitted to income tax department</li>
                    <li>
                      ROC filings once submitted to Registrar of Companies
                    </li>
                    <li>FEMA compliance reports once submitted to RBI</li>
                    <li>Court-ordered financial assessments</li>
                    <li>
                      Time-sensitive regulatory filings within 24 hours of
                      deadline
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Refund Process
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Timeline
                      </h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>Cancellation processing: 24-48 hours</li>
                        <li>Refund initiation: 3-5 business days</li>
                        <li>
                          Credit to original payment method: 5-10 business days
                        </li>
                        <li>Bank transfer refunds: 2-3 business days</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Refund Method
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Refunds will be processed to the original payment method
                        used for the transaction. If the original payment method
                        is unavailable, alternative arrangements will be made
                        after verification.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Exceptions and Special Cases
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Force Majeure
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        In case of force majeure events (natural disasters,
                        government actions, system failures), cancellation and
                        refund terms may be adjusted on a case-by-case basis.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Incorrect Information
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        If incorrect or incomplete information is provided that
                        prevents service completion, cancellation fees may apply
                        even if work has not commenced.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Client Non-Cooperation
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Services may be cancelled by UDIN if clients fail to
                        provide necessary cooperation, documents, or information
                        within reasonable timeframes.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Modification of Services
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Instead of cancellation, you may request modification of
                    services:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>
                      Change of service type (subject to additional charges if
                      applicable)
                    </li>
                    <li>Extension of deadlines (additional fees may apply)</li>
                    <li>Addition of related services to existing orders</li>
                    <li>
                      Upgrade to express or premium processing (price difference
                      applicable)
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Communication Preferences
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    All cancellation requests and communications should be made
                    through:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Email with written confirmation</li>
                    <li>Phone call followed by written confirmation</li>
                    <li>Through your account dashboard (if applicable)</li>
                    <li>
                      In-person visit to our office with proper identification
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Dispute Resolution
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    If you have concerns about our cancellation policy or refund
                    process, please contact our customer service team first. If
                    the matter cannot be resolved, it will be subject to the
                    dispute resolution mechanisms outlined in our Terms of Use.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Policy Updates
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    This Cancellation Policy may be updated from time to time to
                    reflect changes in our services or regulatory requirements.
                    Updated policies will apply to new orders placed after the
                    effective date.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    For cancellation requests or questions about this policy,
                    please contact us:
                  </p>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700">
                      <strong>Cancellation Support:</strong>{" "}
                      cancellation@udin.com
                      <br />
                      <strong>Customer Service:</strong> +91 9876543210
                      <br />
                      <strong>Office Hours:</strong> Monday-Friday, 9:00 AM -
                      6:00 PM IST
                      <br />
                      <strong>Emergency Cancellations:</strong> +91 9876543211
                      (for urgent statutory deadlines)
                    </p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
