const Btn = document.querySelector('.header__Btn');
const menu = document.querySelector('.header__menu');

Btn.addEventListener('click', () => {
    menu.classList.toggle('active');
})

function checkLoginStatus() {
    if (localStorage.getItem('loggedIn') === 'true') {
        document.getElementById('login-button').style.display = 'none';
        document.getElementById('logout-button').style.display = 'block';
    } else {
        document.getElementById('login-button').style.display = 'block';
        document.getElementById('logout-button').style.display = 'none';
    }
}

function logout() {
    fetch('http://localhost:8080/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.removeItem('loggedIn');
            window.location.reload()
        }
        else {
            alert('Log out failed: ' + data.message);
        }
    })
    .catch((error) => {
        console.error('Error: ', error);
        alert('There was a problem with the log out process: ' + error.message);
    });
}

async function fetchHeadlineNews(category) {
    try {
        const url = new URL('http://localhost:8080/news/top');
        const params = new URLSearchParams({ category });
        url.search = params.toString();

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched Data:', data);

        if(data.success && data.result.news.length > 0) {
            const news = data.result.news[0];
            const truncatedTitle = news.summary.length > 300
                    ? news.title.slice(0, 300) + "..."
                    : news.title;
                const truncatedSummary = news.summary.length > 400
                    ? news.summary.slice(0, 400) + "..."
                    : news.summary;
            
            const headlineNewsContainer = document.querySelector('.main__board');
            headlineNewsContainer.innerHTML = `<a href="${news.url}" target="_blank" rel="noopener noreferrer">
                <img src="${news.image_url}" class="board-img">
                <div class="gradient-overlay"></div>
                <div class="text-overlay">
                    <div class="board-title">${truncatedTitle}</div>
                    <div class="category-date">
                        <span class="category">${news.category}</span>
                        <span class="date">${new Date(news.publish_date).toLocaleDateString()}</span>
                    </div>
                    <div class="content">${truncatedSummary}</div>
                </div></a>
                `;
        } else {
            document.querySelector('.main__board').innerHTML = 'No news items found.';
        }        
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.main__board').innerHTML = 'Failed to load news.';
    }
}

async function fetchTopNews(category) {
    try {
        const url = new URL('http://localhost:8080/news/top');
        const params = new URLSearchParams({ category });
        url.search = params.toString();

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched Data:', data);

        if(data.success) {
            const newsList = data.result.news.slice(1, 4);
            const topNewsContainer = document.querySelector('.top-news');
            topNewsContainer.innerHTML = '';

            newsList.forEach(news => {
                const listItem = document.createElement('li');
                listItem.classList.add('item');

                listItem.innerHTML = `
                <a href="${news.url}" target="_blank" rel="noopener noreferrer">
                    <span class="title">${news.title}</span>
                    <div class="category-date">
                        <span class="category">${news.category}</span>
                        <span class="date">${new Date(news.publish_date).toLocaleDateString()}</span>
                    </div>
                </a>
                `;

                topNewsContainer.appendChild(listItem);
            });
        } else {
            document.querySelector('.top-news').innerHTML = 'No news items found.';
        }        
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.top-news').innerHTML = 'Failed to load news.';
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    fetchHeadlineNews('ALL');
    fetchTopNews('ALL');
    checkLoginStatus();
});