# E-Commerce Full Stack Application

تطبيق متجر إلكتروني كامل باستخدام Angular للواجهة الأمامية و Node.js للخادم الخلفي مع MongoDB كقاعدة بيانات.

## المميزات

### للمستخدمين العاديين:

- ✅ تسجيل الدخول وإنشاء حساب جديد
- ✅ تأكيد البريد الإلكتروني
- ✅ تصفح المنتجات والبحث فيها
- ✅ إضافة المنتجات إلى سلة التسوق
- ✅ إدارة سلة التسوق (إضافة، حذف، تحديث الكميات)
- ✅ تحديث الملف الشخصي
- ✅ واجهة مستخدم جميلة وسهلة الاستخدام

### للمديرين:

- ✅ لوحة تحكم خاصة بالمدير
- ✅ إدارة المنتجات (إضافة، تعديل، حذف)
- ✅ إدارة المستخدمين
- ✅ مراقبة المخزون والكميات
- ✅ إحصائيات المبيعات والمستخدمين

### الأمان:

- ✅ تشفير كلمات المرور
- ✅ JWT للتوثيق
- ✅ حماية المسارات
- ✅ معالجة الأخطاء الشاملة
- ✅ التحقق من صحة البيانات

## التقنيات المستخدمة

### Backend:

- **Node.js** - بيئة تشغيل JavaScript
- **Express.js** - إطار عمل الويب
- **MongoDB** - قاعدة البيانات
- **Mongoose** - ODM لـ MongoDB
- **JWT** - التوثيق
- **bcryptjs** - تشفير كلمات المرور
- **nodemailer** - إرسال رسائل البريد الإلكتروني
- **express-validator** - التحقق من صحة البيانات

### Frontend:

- **Angular 16** - إطار عمل الواجهة الأمامية
- **Bootstrap 5** - إطار عمل CSS
- **Font Awesome** - الأيقونات
- **RxJS** - البرمجة التفاعلية

## متطلبات النظام

- Node.js (v16 أو أحدث)
- MongoDB (v4.4 أو أحدث)
- npm أو yarn

## التثبيت والتشغيل

### 1. استنساخ المشروع

```bash
git clone <repository-url>
cd fullstack-ecommerce
```

### 2. تثبيت اعتماديات الخادم

```bash
npm install
```

### 3. تثبيت اعتماديات العميل

```bash
cd client
npm install
cd ..
```

### 4. إعداد متغيرات البيئة

قم بإنشاء ملف `config.env` في المجلد الرئيسي:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-app-password
EMAIL_SERVICE=gmail
CLIENT_URL=http://localhost:4200
```

### 5. إعداد البريد الإلكتروني (اختياري)

لإرسال رسائل تأكيد البريد الإلكتروني:

1. قم بتفعيل المصادقة الثنائية على حساب Gmail
2. أنشئ كلمة مرور للتطبيق
3. أضف البيانات في ملف `config.env`

### 6. تشغيل قاعدة البيانات

تأكد من تشغيل MongoDB على المنفذ الافتراضي (27017)

### 7. تشغيل الخادم

```bash
# للتطوير
npm run dev

# للإنتاج
npm start
```

### 8. تشغيل العميل

```bash
cd client
npm start
```

## الوصول للتطبيق

- **الواجهة الأمامية**: http://localhost:4200
- **الخادم الخلفي**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api

## إنشاء حساب مدير

بعد تشغيل التطبيق، يمكنك إنشاء حساب مدير عبر API:

```bash
curl -X POST http://localhost:5000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

## هيكل المشروع

```
project/
├── server.js                 # نقطة دخول الخادم
├── config.env               # متغيرات البيئة
├── package.json             # اعتماديات الخادم
├── models/                  # نماذج قاعدة البيانات
│   ├── User.js
│   ├── Product.js
│   └── Cart.js
├── routes/                  # مسارات API
│   ├── auth.js
│   ├── users.js
│   ├── products.js
│   ├── cart.js
│   └── admin.js
├── middleware/              # الوسائط البرمجية
│   └── auth.js
├── utils/                   # الأدوات المساعدة
│   └── emailService.js
└── client/                  # تطبيق Angular
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   ├── pages/
    │   │   ├── services/
    │   │   ├── models/
    │   │   ├── guards/
    │   │   └── interceptors/
    │   ├── environments/
    │   └── styles.scss
    ├── package.json
    └── angular.json
```

## API Endpoints

### المصادقة

- `POST /api/auth/signup` - إنشاء حساب جديد
- `POST /api/auth/login` - تسجيل دخول المستخدم
- `POST /api/auth/admin/login` - تسجيل دخول المدير
- `GET /api/auth/confirm-email/:token` - تأكيد البريد الإلكتروني
- `POST /api/auth/resend-confirmation` - إعادة إرسال رسالة التأكيد

### المستخدمين

- `GET /api/users/profile` - الحصول على الملف الشخصي
- `PUT /api/users/profile` - تحديث الملف الشخصي
- `PUT /api/users/change-password` - تغيير كلمة المرور

### المنتجات

- `GET /api/products` - الحصول على جميع المنتجات
- `GET /api/products/:id` - الحصول على منتج واحد
- `POST /api/products` - إنشاء منتج جديد (مدير)
- `PUT /api/products/:id` - تحديث منتج (مدير)
- `DELETE /api/products/:id` - حذف منتج (مدير)

### سلة التسوق

- `GET /api/cart` - الحصول على سلة التسوق
- `POST /api/cart/add` - إضافة منتج للسلة
- `PUT /api/cart/update/:productId` - تحديث كمية منتج
- `DELETE /api/cart/remove/:productId` - إزالة منتج من السلة
- `DELETE /api/cart/clear` - تفريغ السلة

### لوحة تحكم المدير

- `GET /api/admin/dashboard` - إحصائيات لوحة التحكم
- `GET /api/admin/users` - إدارة المستخدمين
- `GET /api/admin/products` - إدارة المنتجات
- `GET /api/admin/carts` - عرض سلات التسوق
- `GET /api/admin/stats` - إحصائيات النظام

## المساهمة

1. قم بعمل Fork للمشروع
2. أنشئ فرع جديد للميزة (`git checkout -b feature/AmazingFeature`)
3. قم بعمل Commit للتغييرات (`git commit -m 'Add some AmazingFeature'`)
4. ادفع إلى الفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

إذا واجهت أي مشاكل أو لديك أسئلة، يرجى فتح issue في GitHub.

## التحديثات المستقبلية

- [ ] نظام الدفع الإلكتروني
- [ ] نظام التقييمات والمراجعات
- [ ] نظام الإشعارات
- [ ] تطبيق الهاتف المحمول
- [ ] نظام العروض والخصومات
- [ ] نظام الشحن والتتبع
