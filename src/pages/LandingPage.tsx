import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, CheckCircle, Star, Users, Zap } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">شركتنا</h1>
          <div className="flex gap-6 items-center">
            <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">خدماتنا</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">من نحن</a>
            <Link to="/contact">
              <Button variant="default">تواصل معنا</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            نحول أفكارك إلى <span className="text-primary">واقع رقمي</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            نقدم حلولاً إبداعية ومبتكرة تساعد عملك على النمو والتميز في السوق الرقمي
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/contact">
              <Button size="lg" className="text-lg px-8 py-6">
                ابدأ مشروعك الآن
              </Button>
            </Link>
            <a href="#services">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                اكتشف خدماتنا
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">+150</div>
              <div className="text-muted-foreground">مشروع منجز</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">+50</div>
              <div className="text-muted-foreground">عميل سعيد</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5</div>
              <div className="text-muted-foreground">سنوات خبرة</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">دعم فني</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">خدماتنا</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              نقدم مجموعة متكاملة من الخدمات الرقمية لتلبية احتياجات عملك
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">تصميم المواقع</h3>
              <p className="text-muted-foreground">
                تصميم مواقع عصرية وجذابة تعكس هوية علامتك التجارية وتجذب العملاء
              </p>
            </div>
            <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">التسويق الرقمي</h3>
              <p className="text-muted-foreground">
                استراتيجيات تسويقية فعالة لزيادة الوعي بعلامتك التجارية وجذب العملاء
              </p>
            </div>
            <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Star className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">تطوير التطبيقات</h3>
              <p className="text-muted-foreground">
                تطوير تطبيقات متكاملة وسهلة الاستخدام لتحسين تجربة عملائك
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">من نحن</h2>
              <p className="text-muted-foreground text-lg mb-6">
                نحن فريق من المحترفين المتحمسين للتكنولوجيا والإبداع. نعمل معاً لتقديم أفضل الحلول الرقمية التي تساعد عملائنا على تحقيق أهدافهم.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  <span className="text-foreground">فريق محترف ومتخصص</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  <span className="text-foreground">حلول مخصصة لكل عميل</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  <span className="text-foreground">دعم فني على مدار الساعة</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  <span className="text-foreground">أسعار تنافسية</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-12 text-center">
              <div className="text-6xl font-bold text-primary mb-4">5+</div>
              <div className="text-xl text-foreground">سنوات من الخبرة والتميز</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            جاهز لبدء مشروعك؟
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            تواصل معنا اليوم واحصل على استشارة مجانية لمشروعك
          </p>
          <Link to="/contact">
            <Button size="lg" className="text-lg px-10 py-6">
              تواصل معنا الآن
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">شركتنا</h3>
              <p className="text-muted-foreground">
                نقدم حلولاً رقمية مبتكرة تساعد الشركات على النمو والتميز
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">روابط سريعة</h3>
              <ul className="space-y-2">
                <li><a href="#services" className="text-muted-foreground hover:text-primary transition-colors">خدماتنا</a></li>
                <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors">من نحن</a></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">اتصل بنا</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">تواصل معنا</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5" />
                  <span>info@company.com</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-5 h-5" />
                  <span>+966 50 000 0000</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span>الرياض، المملكة العربية السعودية</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-10 pt-8 text-center text-muted-foreground">
            <p>© 2025 شركتنا. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
