const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '..')));

app.get('/search', async (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) {
        return res.status(400).json({ error: '缺少关键词' });
    }

    try {
        const result = await searchInKnowledgeBase(keyword);
        res.json({ result });
    } catch (error) {
        console.error('搜索错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

async function searchInKnowledgeBase(keyword) {
    const knowledgeBasePath = path.join(__dirname, 'knowledge_base');
    const files = await fs.readdir(knowledgeBasePath);
    let allResults = [];

    console.log(`搜索关键词: ${keyword}`);
    console.log(`找到的文件: ${files.join(', ')}`);

    for (const file of files) {
        if (path.extname(file).toLowerCase() === '.json') {
            const filePath = path.join(knowledgeBasePath, file);
            console.log(`正在搜索文件: ${file}`);
            const content = await fs.readFile(filePath, 'utf-8');
            const knowledgeBase = JSON.parse(content);
            
            if (knowledgeBase.questions && Array.isArray(knowledgeBase.questions)) {
                console.log(`题库中的题目数量: ${knowledgeBase.questions.length}`);

                const results = knowledgeBase.questions.filter(item => 
                    item.question.toLowerCase().includes(keyword.toLowerCase()) ||
                    item.options.some(option => option.toLowerCase().includes(keyword.toLowerCase())) ||
                    (item.answer && item.answer.toLowerCase().includes(keyword.toLowerCase()))
                );

                console.log(`在 ${file} 中找到 ${results.length} 个匹配结果`);

                allResults = allResults.concat(results);
            } else {
                console.log(`文件 ${file} 中没有找到有效的题库结构`);
            }
        }
    }

    console.log(`总共找到 ${allResults.length} 个匹配结果`);

    if (allResults.length === 0) {
        return '没有找到匹配的结果';
    }

    return allResults.map(item => `
## ${item.question}

选项:
${item.options.join('\n')}

答案: ${item.answer}
    `).join('\n\n---\n\n');
}

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});