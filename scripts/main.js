document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsDiv = document.getElementById('results');

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    function performSearch() {
        const keyword = searchInput.value.trim();
        if (keyword) {
            fetch(`/search?keyword=${encodeURIComponent(keyword)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.result && data.result !== '没有找到匹配的结果') {
                        const results = data.result.split('\n\n---\n\n');
                        resultsDiv.innerHTML = results.map(result => {
                            const [title, ...content] = result.split('\n');
                            return `<div class="result-item">
                                <h3>${title.replace('## ', '')}</h3>
                                <p>${content.join('<br>')}</p>
                            </div>`;
                        }).join('');
                    } else {
                        resultsDiv.innerHTML = '没有找到相关结果';
                    }
                })
                .catch(error => {
                    console.error('搜索出错:', error);
                    resultsDiv.innerHTML = '搜索过程中出现错误,请稍后再试。';
                });
        } else {
            resultsDiv.innerHTML = '请输入搜索关键词';
        }
    }
});