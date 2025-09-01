# 🔄 Genspark RTL Toolbox

🇺🇸 **For English documentation - [Click here](README.md)**  
🇮🇱 **לתיעוד בעברית - המשך לקרוא למטה**

**תמיכה משופרת בעברית וכיוון RTL עם כלי הורדת שיחות עבור Genspark.ai**

[![רישיון: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![גרסה](https://img.shields.io/badge/version-2.3-blue.svg)](https://github.com/Dude775/genspark-rtl-toolbox/releases)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chromewebstore.google.com)

---

## ✨ מה התוסף מציע

### 🔤 **תמיכה בעברית ו-RTL**
- **תמיכה מלאה בעברית, ערבית ופרסית** בממשק Genspark.ai
- **זיהוי אוטומטי של כיוון הטקסט** לתוכן מעורב שפות
- **עיצוב CSS מותאם** אופטימלי לשפות RTL
- **הפעלה וכיבוי RTL** בלחיצה פשוטה

### 💾 **הורדת שיחות**
- **ייצוא שיחות שלמות** לקבצי טקסט
- **שימור עיצוב** ומבנה ההודעות
- **כולל חותמות זמן** וזיהוי משתמש/בינה מלאכותית
- **יכולת ייצוא מרובה** של שיחות

### 🎨 **ממשק מקצועי**
- **עיצוב popup מודרני** עם בקרות אינטואיטיביות
- **אינדיקטורי סטטוס בזמן אמת** ומשוב התקדמות
- **פאנל הגדרות מקיף** להתאמה אישית
- **טיפול בשגיאות** עם הודעות ידידותיות למשתמש

---

## 🚀 התקנה

### מ-Chrome Web Store (מומלץ)
1. בקר ב-[Chrome Web Store](https://chromewebstore.google.com)
2. חפש "Genspark RTL Toolbox"
3. לחץ "הוסף ל-Chrome"
4. תהנה מחוויית Genspark משופרת!

### התקנה ידנית (מצב מפתח)
1. הורד את [הגרסה האחרונה](https://github.com/Dude775/genspark-rtl-toolbox/releases)
2. חלץ את קובץ ה-ZIP
3. פתח Chrome → הגדרות → תוספים
4. הפעל "מצב מפתח" (בפינה הימנית העליונה)
5. לחץ "טען לא ארוז" ובחר את התיקייה המחולצת

---

## 📖 שימוש

### תמיכת RTL
1. נווט ל-[Genspark.ai](https://genspark.ai)
2. לחץ על סמל התוסף בסרגל הכלים
3. הפעל "אפשר RTL" כדי להפעיל תמיכה בעברית/ערבית
4. תהנה מטקסט RTL מעוצב כראוי!

### הורדת שיחות
1. פתח כל שיחה ב-Genspark.ai
2. לחץ על סמל התוסף
3. לחץ "הורד שיחה"
4. הקובץ יישמר בתיקיית ההורדות שלך

---

## 🛠️ פרטים טכניים

### ארכיטקטורה
- **תאימות Manifest V3** לתוספי Chrome מודרניים
- **Content Script** למניפולציה של DOM ועיצוב RTL
- **Background Service Worker** לשימור נתונים
- **ממשק Popup** לבקרות משתמש

### הרשאות נדרשות
- `tabs` - גישה למידע על טאב פעיל
- `scripting` - הזרקת סגנונות RTL ופונקציונליות
- `storage` - שמירת העדפות משתמש
- `downloads` - ייצוא קבצי שיחות
- `host_permissions` - גישה לדומיין genspark.ai

### תאימות דפדפנים
- **Chrome 88+** (תמיכה ב-Manifest V3)
- **Edge 88+** (מבוסס Chromium)
- **Opera 74+** (מבוסס Chromium)

---

## 🔧 פיתוח

### מבנה הפרויקט
```
genspark-rtl-toolbox/
├── manifest.json          # הגדרות התוסף
├── content.js            # הלוגיקה הראשית של RTL והורדות
├── popup.html           # ממשק popup התוסף
├── popup.js             # פונקציונליות ה-popup
├── background.js        # שירות רקע
├── rtl-styles.css       # חוקי עיצוב RTL
├── icon16.png          # אייקון התוסף (16x16)
├── icon48.png          # אייקון התוסף (48x48)
├── icon128.png         # אייקון התוסף (128x128)
└── README.md           # קובץ זה
```

### הוראות בנייה
1. שכפל את הרפוזיטורי הזה
2. אין צורך בתהליך בנייה - טען ישירות ב-Chrome
3. לייצור: צור ZIP של כל הקבצים מלבד README.md

---

## 🐛 פתרון בעיות

### בעיות נפוצות

**התוסף לא עובד ב-Genspark.ai?**
- רענן את הדף אחרי התקנה
- ודא שאתה ב-genspark.ai (לא בדומיינים אחרים)
- בדוק אם התוסף מופעל ב-Chrome

**טקסט RTL עדיין נראה שגוי?**
- נסה לכבות ולהדליק RTL שוב
- נקה את זיכרון המטמון של הדפדפן וטען מחדש את הדף
- ודא שאתה משתמש בשפת RTL נתמכת

**הורדות לא עובדות?**
- בדוק הרשאות הורדה ב-Chrome
- ודא שחוסם פופ-אפ לא מפריע
- ודא שלשיחה יש תוכן להורדה

---

## 🤝 תרומה לפרויקט

אנו מזמינים תרומות! אתם מוזמנים:

1. **לדווח על באגים** דרך GitHub Issues
2. **להציע פיצ'רים** לגרסאות עתידיות
3. **להגיש pull requests** עם שיפורים
4. **לעזור בתרגום** לשפות נוספות

### הגדרת סביבת פיתוח
```bash
git clone https://github.com/Dude775/genspark-rtl-toolbox.git
cd genspark-rtl-toolbox
# טען תוסף לא ארוז במצב מפתח של Chrome
```

---

## 📋 רשימת שינויים

### v2.3 (נוכחית)
- ✅ שיפור אלגוריתם זיהוי RTL
- ✅ שיפור פונקציונליות הורדת שיחות
- ✅ עיצוב ממשק popup מודרני
- ✅ טיפול משופר בשגיאות ומשוב למשתמש
- ✅ תאימות Manifest V3

### v2.2
- הוספת background service worker
- שיפור עיצוב CSS עבור RTL
- תיקוני באגים בהזרקת content script

### v2.1
- תמיכה ראשונית ב-RTL
- הורדת שיחות בסיסית
- אב-טיפוס ממשק popup

---

## 📞 תמיכה

- **GitHub Issues**: [דווח על באגים או בקש פיצ'רים](https://github.com/Dude775/genspark-rtl-toolbox/issues)
- **מדיניות פרטיות**: [עיין במדיניות הפרטיות שלנו](https://dude775.github.io/genspark-rtl-privacy/)
- **אימייל**: צור GitHub issue לתגובה מהירה ביותר

---

## 📜 רישיון

הפרויקט הזה מורשה תחת **רישיון MIT** - ראה קובץ [LICENSE](LICENSE) לפרטים.

---

## 🌟 תודות

- תודה לצוות **Genspark.ai** על יצירת פלטפורמת בינה מלאכותית מדהימה
- **קהילות שפות RTL** על משוב ובדיקות
- **קהילת תוספי Chrome** על משאבי פיתוח

---



**נוצר באהבה ❤️ עבור הקהילה דוברת העברית/RTL**

[⭐ כוכב לרפו](https://github.com/Dude775/genspark-rtl-toolbox) | [🐛 דווח על בעיות](https://github.com/Dude775/genspark-rtl-toolbox/issues) | [💡 בקש פיצ'רים](https://github.com/Dude775/genspark-rtl-toolbox/issues/new)

