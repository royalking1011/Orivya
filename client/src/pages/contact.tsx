import { Layout } from "@/components/layout";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <Layout>
      <div className="min-h-[80vh] bg-gradient-to-br from-fuchsia-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-14">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-serif font-bold tracking-tight">
                Contact Us
              </h1>
              <p className="mt-3 text-black/60">
                Need help with orders, products, or support? Send us a message.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* INFO */}
              <div className="rounded-3xl border bg-white p-8 shadow-sm space-y-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-fuchsia-600 mt-1" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-black/60 text-sm">
                      support@orivyaeco.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-black/60 text-sm">+91 00000 00000</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-fuchsia-600 mt-1" />
                  <div>
                    <p className="font-semibold">Office</p>
                    <p className="text-black/60 text-sm">
                      Orivya Eco Pvt. Ltd. <br />
                      India
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 p-6 text-white">
                  <p className="font-semibold">Response Time</p>
                  <p className="text-white/80 text-sm mt-1">
                    We reply within 24 hours (Mon–Sat).
                  </p>
                </div>
              </div>

              {/* FORM */}
              <div className="rounded-3xl border bg-white p-8 shadow-sm">
                <form className="space-y-4">
                  <Input placeholder="Your Name" />
                  <Input placeholder="Your Email" type="email" />
                  <Input placeholder="Subject" />
                  <Textarea placeholder="Write your message..." rows={6} />

                  <Button className="w-full rounded-2xl">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>

                  <p className="text-xs text-black/50 text-center">
                    (This is UI only for now. Later we can connect it to backend
                    email system.)
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
