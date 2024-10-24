function createPageBtn(page, classes = []) {
    let btn = document.createElement('button');
    classes.push('btn');
    classes.forEach(cls => btn.classList.add(cls));
    btn.dataset.page = page;
    btn.innerHTML = page;
    return btn;
}

function renderPaginationElement(info) {
    let btn;
    let paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    btn = createPageBtn(1, ['first-page-btn']);
    btn.innerHTML = 'Первая страница';
    if (info.current_page == 1) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);

    let buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('pages-btns');
    paginationContainer.append(buttonsContainer);

    let start = Math.max(info.current_page - 2, 1);
    let end = Math.min(info.current_page + 2, info.total_pages);
    for (let i = start; i <= end; i++) {
        buttonsContainer.append(createPageBtn(i, i == info.current_page ? ['active'] : []));
    }

    btn = createPageBtn(info.total_pages, ['last-page-btn']);
    btn.innerHTML = 'Последняя страница';
    if (info.current_page == info.total_pages) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);
}

function perPageBtnHandler(event) {
    downloadData(1);
}

function setPaginationInfo(info) {
    document.querySelector('.total-count').innerHTML = info.total_count;
    let start = info.total_count > 0 ? (info.current_page - 1) * info.per_page + 1 : 0;
    document.querySelector('.current-interval-start').innerHTML = start;
    let end = Math.min(info.total_count, start + info.per_page - 1);
    document.querySelector('.current-interval-end').innerHTML = end;
}

function pageBtnHandler(event) {
    if (event.target.dataset.page) {
        downloadData(event.target.dataset.page);
        window.scrollTo(0, 0);
    }
}

function createAuthorElement(record) {
    let user = record.user || { 'name': { 'first': '', 'last': '' } };
    let authorElement = document.createElement('div');
    authorElement.classList.add('author-name');
    authorElement.innerHTML = user.name.first + ' ' + user.name.last;
    return authorElement;
}

function createUpvotesElement(record) {
    let upvotesElement = document.createElement('div');
    upvotesElement.classList.add('upvotes');
    upvotesElement.innerHTML = record.upvotes;
    return upvotesElement;
}

function createFooterElement(record) {
    let footerElement = document.createElement('div');
    footerElement.classList.add('item-footer');
    footerElement.append(createAuthorElement(record));
    footerElement.append(createUpvotesElement(record));
    return footerElement;
}

function createContentElement(record) {
    let contentElement = document.createElement('div');
    contentElement.classList.add('item-content');
    contentElement.innerHTML = record.text;
    return contentElement;
}

function createListItemElement(record) {
    let itemElement = document.createElement('div');
    itemElement.classList.add('facts-list-item');
    itemElement.append(createContentElement(record));
    itemElement.append(createFooterElement(record));
    return itemElement;
}

function renderRecords(records) {
    let factsList = document.querySelector('.facts-list');
    factsList.innerHTML = '';
    for (let i = 0; i < records.length; i++) {
        factsList.append(createListItemElement(records[i]));
    }
}

function downloadData(page = 1, query = '') {
    let factsList = document.querySelector('.facts-list');
    let url = new URL('http://cat-facts-api.std-900.ist.mospolytech.ru/facts');
    let perPage = document.querySelector('.per-page-btn').value;
    url.searchParams.append('page', page);
    url.searchParams.append('per-page', perPage);
    if (query) {
        url.searchParams.append('q', query);
    }
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        if (this.status === 200) {
            renderRecords(this.response.records);
            setPaginationInfo(this.response['_pagination']);
            renderPaginationElement(this.response['_pagination']);
        } else {
            console.error('Ошибка загрузки данных:', this.status, this.statusText);
        }
    }
    xhr.send();
}

function handleSearch() {
    let query = document.querySelector('.search-field').value;
    downloadData(1, query);
}

function autocomplete(query) {
    let url = new URL('http://cat-facts-api.std-900.ist.mospolytech.ru/autocomplete');
    url.searchParams.append('q', query);

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        if (this.status === 200) {
            renderAutocomplete(this.response);
        } else {
            console.error('Ошибка автодополнения:', this.status, this.statusText);
        }
    }
    xhr.send();
}

function renderAutocomplete(suggestions) {
    let list = document.querySelector('.autocomplete-list');
    list.innerHTML = '';
    if (suggestions.length > 0) {
        list.style.display = 'block';
        suggestions.forEach(suggestion => {
            let item = document.createElement('div');
            item.classList.add('autocomplete-item');
            item.innerHTML = suggestion;
            item.addEventListener('click', function () {
                document.querySelector('.search-field').value = suggestion;
                list.style.display = 'none';
            });
            list.appendChild(item);
        });
    } else {
        list.style.display = 'none';
    }
}

window.onload = function () {
    downloadData();
    document.querySelector('.pagination').onclick = pageBtnHandler;
    document.querySelector('.per-page-btn').onchange = perPageBtnHandler;

    let searchField = document.querySelector('.search-field');
    searchField.addEventListener('input', function () {
        if (searchField.value.length > 1) {
            autocomplete(searchField.value);
        } else {
            document.querySelector('.autocomplete-list').style.display = 'none';
        }
    });

    document.querySelector('.search-btn').addEventListener('click', handleSearch);
}
