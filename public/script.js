// פונקציה לעבור בין טאבים
function openTab(evt, tabName) {
    var tabContents = document.getElementsByClassName("tab-content");
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }
    var tabButtons = document.getElementsByClassName("tab-button");
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
    
    // טען קבצים בטאב החדש
    loadFiles(tabName);
}

// טען קבצים מהשרת
async function loadFiles(type) {
    // בני ID נכון: 'imagePreview' במקום 'imagesPreview'
    const previewId = type === 'images' ? 'imagePreview' : type === 'videos' ? 'videoPreview' : 'songPreview';
    const preview = document.getElementById(previewId);
    if (!preview) {
        console.error('Preview element not found for:', previewId);
        return;
    }
    preview.innerHTML = ''; // נקה תצוגה
    try {
        console.log('Loading files for:', type); // לוג לבדיקה
        const response = await fetch(`/${type}`);
        console.log('Fetch response status:', response.status); // לוג לבדיקה
        if (!response.ok) {
            throw new Error('תגובה לא תקינה מהשרת');
        }
        const files = await response.json();
        console.log('Loaded files for', type + ':', files); // לוג לבדיקה
        if (files.length === 0) {
            preview.innerHTML = '<p>אין קבצים כאן עדיין.</p>'; // הודעה אם ריק
            return;
        }
        files.forEach(file => {
            console.log('Creating element for:', file); // לוג לבדיקה
            if (type === 'images') {
                const img = document.createElement('img');
                img.src = file;
                img.alt = file.split('/').pop(); // אלט טקסט
                img.style.maxWidth = '200px'; // גודל קבוע
                img.style.cursor = 'pointer'; // סמן יד
                img.onclick = () => window.open(file, '_blank'); // פתיחה בגודל מלא
                img.onerror = () => {
                    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9vcHMgdGV0dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5ldCB0b2RheTwvdGV4dD48L3N2Zz4='; // איקון שגיאה פשוט
                };
                preview.appendChild(img);
            } else if (type === 'videos') {
                const video = document.createElement('video');
                video.src = file;
                video.controls = true;
                video.style.maxWidth = '200px';
                preview.appendChild(video);
            } else if (type === 'songs') {
                const label = document.createElement('p');
                label.textContent = file.split('/').pop(); // שם קובץ
                const audio = document.createElement('audio');
                audio.src = file;
                audio.controls = true;
                preview.appendChild(label);
                preview.appendChild(audio);
            }
        });
    } catch (err) {
        console.error('שגיאה בטעינה:', err);
        preview.innerHTML = '<p>שגיאה בטעינת קבצים. נסה שוב.</p>';
    }
}

// העלאה עם סיסמה
async function uploadFile(inputId, type) {
    const input = document.getElementById(inputId);
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    const password = prompt('הכנס סיסמה להעלאה:');
    if (!password) return;
    formData.append('password', password);

    try {
        console.log('Uploading file:', file.name, 'to type:', type); // לוג לבדיקה
        const response = await fetch(`/upload/${type}`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        console.log('Upload response:', data); // לוג לבדיקה
        if (data.success) {
            alert('הועלה בהצלחה!');
            loadFiles(type); // טען מחדש
            input.value = ''; // נקה
        } else {
            alert(data.error || 'שגיאה בהעלאה');
        }
    } catch (err) {
        console.error('שגיאה בהעלאה:', err);
        alert('שגיאה בהעלאה - בדוק את הקונסול');
    }
}

// מאזינים להעלאות
document.getElementById('imageUpload').addEventListener('change', () => uploadFile('imageUpload', 'images'));
document.getElementById('videoUpload').addEventListener('change', () => uploadFile('videoUpload', 'videos'));
document.getElementById('songUpload').addEventListener('change', () => uploadFile('songUpload', 'songs'));

// טען קבצים בהתחלה ובמעבר טאב
document.addEventListener('DOMContentLoaded', () => {
    openTab({currentTarget: document.querySelector('.tab-button.active')}, 'images');
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const onclickStr = e.target.getAttribute('onclick');
            const match = onclickStr.match(/'([^']+)'/);
            if (match) {
                openTab(e, match[1]); // קריאה ל-openTab עם tabName
            }
        });
    });
});