const Btn = document.querySelector('.header__Btn');
const menu = document.querySelector('.header__menu');
const right = document.querySelector('.header__right');

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

        if(data.success) {
            const newsList = data.result.news.slice(0, 2);
            const topNewsContainer = document.querySelector('.headline__news');
            topNewsContainer.innerHTML = '';

            newsList.forEach(news => {
                const truncatedTitle = news.summary.length > 300
                    ? news.title.slice(0, 300) + "..."
                    : news.title;
                const truncatedSummary = news.summary.length > 400
                    ? news.summary.slice(0, 400) + "..."
                    : news.summary;
                const listItem = document.createElement('li');
                listItem.classList.add('headline__item');

                listItem.innerHTML = `<a href="${news.url}" target="_blank" rel="noopener noreferrer">
                    <div class="headline__item-info">
                        <span class="headline__item-title">${truncatedTitle}</span>
                        <div class="category-date">
                            <span class="category">${news.category}</span>
                            <span class="date">${new Date(news.publish_date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <img src="${news.image_url}" class="headline-img">
                    <div class="gradient-overlay"></div>
                    <div class="text-overlay">
                        <span class="headline__item-content">${truncatedSummary}</span>
                    </div></a>
                `;

                topNewsContainer.appendChild(listItem);
            });
        } else {
            document.querySelector('.headline__news').innerHTML = 'No news items found.';
        }        
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.headline__news').innerHTML = 'Failed to load news.';
    }
}

async function fetchRecentNews(category, page) {
    try {
        const url = new URL('http://localhost:8080/news');
        const params = new URLSearchParams({ category, page });
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
            const newsList = data.result.news;
            const totalPages = data.result.total_pages;
            const resultContainer = document.querySelector('.recent__news');
            // resultContainer.innerHTML = '';

            newsList.forEach(news => {
                const truncatedSummary = news.summary.length > 400
                    ? news.summary.slice(0, 200) + "..."
                    : news.summary;
                const listItem = document.createElement('li');
                listItem.classList.add('recent__item');

                listItem.innerHTML = `
                <a href="${news.url}" target="_blank" rel="noopener noreferrer">
                    <img src="${news.image_url}" class="recent__item-image">
                    <div class="recent__item-info">
                        <span class="recent__item-title">${news.title}</span>
                        <div class="category-date">
                            <span class="category">${news.category}</span>
                            <span class="date">${new Date(news.publish_date).toLocaleDateString()}</span>
                        </div>
                        <span class="content">"${truncatedSummary}"</span>
                    </div>
                </a>
                `;

                resultContainer.appendChild(listItem);
            });

            more(totalPages, page);
        } else {
            document.querySelector('.result__news').innerHTML = 'No news items found.';
        }        
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.result__news').innerHTML = 'Failed to load news.';
    }
}

function more(totalPages, currentPage) {
    const moreControls = document.getElementById('more');
    const moreBtn = document.getElementById('more-btn');

    if (totalPages <= 1) {
        moreControls.style.display = 'none';
        return;
    }

    if (currentPage === totalPages) {
        moreControls.innerHTML = '';
    }

    moreBtn.onclick = () => {
        fetchRecentNews('BUSINESS', currentPage+1);
    };
}

document.addEventListener('DOMContentLoaded', (event) => {
    fetchHeadlineNews('BUSINESS')
    fetchRecentNews('BUSINESS', 1);
    checkLoginStatus();
});