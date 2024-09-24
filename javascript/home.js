const Btn = document.querySelector('.header__Btn');
const menu = document.querySelector('.header__menu');

Btn.addEventListener('click', () => {
    menu.classList.toggle('active');
})

function checkLoginStatus() {
    if (localStorage.getItem('loggedIn') === 'true') {
        document.getElementById('login-button').style.display = 'none';
        document.getElementById('logout-button').style.display = 'block';
        console.log('ID:', localStorage.getItem('id'));
        // fetchRecommendedNews('ALL');
    } else {
        document.getElementById('login-button').style.display = 'block';
        document.getElementById('logout-button').style.display = 'none';

        const recommendedNewsContainer = document.querySelector('.recommended__news');
        recommendedNewsContainer.innerHTML = '<span class="no-recommend">Please log in.</span>';
    }
}

function logout() {
    fetch('http://52.78.41.92:8080/logout', {
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
        const url = new URL('http://52.78.41.92:8080/news/top');
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

            headlineNewsContainer.addEventListener('click', async (event) => {
                const newsLink = event.target.closest('a');
                if (newsLink) {
                    const newsId = news.id;
                    console.log('newsId:', newsId);

                    var data = {
                        "news_id": newsId
                    }

                    fetch('http://52.78.41.92:8080/click-log', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data),
                        credentials: 'include'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            console.log('ID 전송 성공:', newsId);
                        }
                        else {
                            console.log('ID 전송 실패:', data.message);
                        }
                    })
                    .catch ((error) => {
                        console.error('ID 전송 에러:', error, '-', error.message);
                    });
                }
            });
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
        const url = new URL('http://52.78.41.92:8080/news/top');
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
                <a href="${news.url}" target="_blank" rel="noopener noreferrer" data-news-id="${news.id}">
                    <span class="title">${news.title}</span>
                    <div class="category-date">
                        <span class="category">${news.category}</span>
                        <span class="date">${new Date(news.publish_date).toLocaleDateString()}</span>
                    </div>
                </a>
                `;

                topNewsContainer.appendChild(listItem);
            });

            topNewsContainer.addEventListener('click', async (event) => {
                const newsLink = event.target.closest('a');
                if (newsLink) {
                    const newsId = newsLink.getAttribute('data-news-id');

                    try {
                        const response = await fetch('http://52.78.41.92:8080/click-log', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ news_id: newsId })
                        });

                        if (!response.ok) {
                            const errorMessage = `서버로 ID 전송 실패: ${response.status} - ${response.statusText}`;
                            throw new Error(errorMessage);
                        }

                        console.log('ID 전송 성공:', newsId);
                    } catch (error) {
                        console.error('ID 전송 에러:', error.message);
                    }
                }
            });
        } else {
            document.querySelector('.top-news').innerHTML = 'No news items found.';
        }        
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.top-news').innerHTML = 'Failed to load news.';
    }
}

async function fetchRecommendedNews(category) {
    try {
        const url = new URL('http://52.78.41.92:8080/news/recommended');
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
            const newsList = data.result.news.slice(6);
            const recommendedNewsContainer = document.querySelector('.recommended__news');
            recommendedNewsContainer.innerHTML = '';

            newsList.forEach(news => {
                const listItem = document.createElement('li');
                listItem.classList.add('recommended__item');

                listItem.innerHTML = `
                <a href="${news.url}" target="_blank" rel="noopener noreferrer" data-news-id="${news.id}">
                    <img src="${news.image_url}" class="recommended__item-img">
                    <div class="recommended__item-info">
                        <span class="title">${news.title}</span>
                        <div class="category-date">
                            <span class="category">${news.category}</span>
                            <span class="date">${new Date(news.publish_date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </a>
                `;

                recommendedNewsContainer.appendChild(listItem);
            });

            recommendedNewsContainer.addEventListener('click', async (event) => {
                const newsLink = event.target.closest('a');
                if (newsLink) {
                    const newsId = newsLink.getAttribute('data-news-id');

                    try {
                        const response = await fetch('http://52.78.41.92:8080/click-log', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ news_id: newsId })
                        });

                        if (!response.ok) {
                            const errorMessage = `서버로 ID 전송 실패: ${response.status} - ${response.statusText}`;
                            throw new Error(errorMessage);
                        }

                        console.log('ID 전송 성공:', newsId);
                    } catch (error) {
                        console.error('ID 전송 에러:', error.message);
                    }
                }
            });
        } else {
            document.querySelector('.recommended__news').innerHTML = 'No news items found.';
        }        
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.recommended__news').innerHTML = 'Failed to load news.';
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    fetchHeadlineNews('ALL');
    fetchTopNews('ALL');
    checkLoginStatus();
});