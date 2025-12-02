import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowRight, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "تم إرسال رسالتك بنجاح!",
      description: "سنتواصل معك في أقرب وقت ممكن.",
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">شركتنا</Link>
          <div className="flex gap-6 items-center">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              الرئيسية
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-12 px-6">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-5xl font-bold text-foreground mb-6">تواصل معنا</h1>
          <p className="text-xl text-muted-foreground">
            نحن هنا لمساعدتك. أرسل لنا رسالة وسنرد عليك في أقرب وقت
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-card p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">أرسل لنا رسالة</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-foreground mb-2 font-medium">الاسم الكامل</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="أدخل اسمك الكامل"
                    required
                    className="text-right"
                  />
                </div>
                <div>
                  <label className="block text-foreground mb-2 font-medium">البريد الإلكتروني</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                    dir="ltr"
                    className="text-left"
                  />
                </div>
                <div>
                  <label className="block text-foreground mb-2 font-medium">رقم الهاتف</label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+966 50 000 0000"
                    dir="ltr"
                    className="text-left"
                  />
                </div>
                <div>
                  <label className="block text-foreground mb-2 font-medium">رسالتك</label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="اكتب رسالتك هنا..."
                    rows={5}
                    required
                    className="text-right"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full text-lg">
                  <Send className="w-5 h-5 ml-2" />
                  إرسال الرسالة
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">معلومات التواصل</h2>
                <p className="text-muted-foreground mb-8">
                  يمكنك التواصل معنا عبر أي من الطرق التالية. فريقنا جاهز لمساعدتك على مدار الساعة.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">البريد الإلكتروني</h3>
                    <p className="text-muted-foreground">info@company.com</p>
                    <p className="text-muted-foreground">support@company.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">الهاتف</h3>
                    <p className="text-muted-foreground" dir="ltr">+966 50 000 0000</p>
                    <p className="text-muted-foreground" dir="ltr">+966 11 000 0000</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">العنوان</h3>
                    <p className="text-muted-foreground">الرياض، المملكة العربية السعودية</p>
                    <p className="text-muted-foreground">شارع الملك فهد، برج الأعمال</p>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="p-6 bg-muted/30 rounded-xl">
                <h3 className="font-bold text-foreground mb-4">ساعات العمل</h3>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>الأحد - الخميس</span>
                    <span>9:00 ص - 6:00 م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الجمعة - السبت</span>
                    <span>مغلق</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-6 mt-12">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 شركتنا. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
