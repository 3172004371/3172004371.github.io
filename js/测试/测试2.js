// 目录数据结构（从JSON动态生成）
let directoryData = {
    id: "root",
    title: "小组实验项目",
    type: "folder",
    expanded: true,
    items: [] // 成员列表将从JSON加载
};

// 当前打开的成员面板
let currentOpenPanel = null;
// 当前选中的路径
let currentPath = [];

// 解析JSON数据
function parseJSON(jsonData) {
    const data = jsonData || [];
    return data;
}

// 从本地JSON文件加载数据
async function loadDirectoryData(jsonPath) {
    try {
        const response = await fetch(jsonPath);
        const jsonData = await response.json();
        const members = parseJSON(jsonData);

        // 更新目录数据
        directoryData.items = members;
        return members;
    } catch (error) {
        console.error('加载目录数据失败:', error);
        return [];
    }
}

// 渲染成员列表
function renderMembersList(members) {
    const membersContainer = document.getElementById('members-container');
    membersContainer.innerHTML = '';

    if (members.length === 0) {
        membersContainer.innerHTML = '<div class="text-gray-500 italic">暂无成员数据</div>';
        return;
    }

    const membersList = document.createElement('ul');
    membersList.className = 'members-list'; // 添加类名

    members.forEach(member => {
        const memberItem = document.createElement('li');
        memberItem.innerHTML = `
            <a href="#" data-id="${member.id}">
                <i class="fa fa-user mr-2"></i>
                <span>${member.title}</span>
            </a>
        `;
        membersList.appendChild(memberItem);

        // 绑定点击事件
        memberItem.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault(); // 阻止默认行为
            openMemberPanel(member);
        });
    });

    membersContainer.appendChild(membersList);
}

// 打开成员面板
function openMemberPanel(member) {
    // 关闭当前打开的面板（如果有）
    if (currentOpenPanel && currentOpenPanel.id !== member.id) {
        const previousPanel = document.getElementById(`member-panel-${currentOpenPanel.id}`);
        if (previousPanel) {
            previousPanel.style.display = 'none';
        }
    }

    // 检查面板是否已存在
    let panel = document.getElementById(`member-panel-${member.id}`);

    if (!panel) {
        // 克隆面板模板
        const panelTemplate = document.getElementById('member-panel-template');
        panel = panelTemplate.cloneNode(true);
        panel.id = `member-panel-${member.id}`;
        panel.style.display = 'block';
        const membersContainer = document.getElementById('members-container');
        membersContainer.appendChild(panel);

        // 设置面板标题
        const panelTitle = panel.querySelector('.panel-member-title');
        panelTitle.textContent = member.title;

        // 渲染文件树
        const fileTree = panel.querySelector('.file-tree');
        renderFileTree(member, fileTree);

        // 绑定关闭按钮
        panel.querySelector('.close-panel').addEventListener('click', () => {
            panel.style.display = 'none';
            currentOpenPanel = null;
        });
    } else {
        // 面板已存在，直接显示
        panel.style.display = 'block';
    }

    // 记录当前打开的面板
    currentOpenPanel = member;

    // 处理成员列表导航高亮
    const memberLinks = document.querySelectorAll('.members-list li a');
    memberLinks.forEach(link => {
        if (link.dataset.id === member.id) {
            link.parentElement.classList.add('active');
        } else {
            link.parentElement.classList.remove('active');
        }
    });

    // 默认选中成员根目录
    selectPath([member.title]);
    // 新增：成员面板打开后强制同步高度（关键修复）
    syncPanelHeights();
}

// 渲染文件树
function renderFileTree(member, container) {
    container.innerHTML = '';
    const rootNode = document.createElement('div');
    rootNode.className = 'tree-item active';
    rootNode.dataset.path = member.title;
    rootNode.innerHTML = `
        <i class="fa fa-folder-open text-[--color-primary]"></i>
        <span>${member.title}</span>
    `;
    container.appendChild(rootNode);

    // 绑定点击事件
    rootNode.addEventListener('click', () => {
        selectPath([member.title]);
        document.querySelectorAll('.tree-item').forEach(node => {
            node.classList.remove('active');
        });
        rootNode.classList.add('active');
    });

    // 创建实验文件夹节点
    const experimentsContainer = document.createElement('div');
    experimentsContainer.className = 'tree-children expanded';
    container.appendChild(experimentsContainer);

    // 递归渲染实验文件夹及子文件夹
    const renderSubTree = (parentContainer, items, parentPath = [member.title]) => {
        items.forEach(item => {
            const itemNode = document.createElement('div');
            itemNode.className = 'tree-item';
            const path = [...parentPath, item.title];
            itemNode.dataset.path = path.join('/');
            // console.log("渲染树节点时生成的路径:", itemNode.dataset.path);
            const { iconClass, iconColor } = getIconAndColor(item);

            itemNode.innerHTML = `
                <div class="flex items-center justify-between w-full">
                    <div class="flex items-center">
                        <i class="fa ${iconClass} ${iconColor}"></i>
                        <span class="ml-2">${item.title}</span>
                    </div>
                    <div class="flex items-center justify-end ml-auto">
                        ${item.type === 'folder' ? `
                            <i class="fa fa-chevron-right"></i>
                        ` : item.action ? `
                            <a href="${item.file}" target="_blank" class="mr-2 text-[--color-primary] text-sm hover:underline">
                                <i class="fa fa-external-link"></i>
                            </a>
                            <a href="${item.file}" download class="text-[--color-primary] text-sm hover:underline">
                                <i class="fa fa-download"></i>
                            </a>
                        ` : ''}
                    </div>
                </div>
            `;
            parentContainer.appendChild(itemNode);

            if (item.type === 'folder') {
                // 创建子文件/文件夹容器
                const childrenContainer = document.createElement('div');
                childrenContainer.className = `tree-children ${item.expanded ? 'expanded' : ''}`;
                parentContainer.appendChild(childrenContainer);

                if (item.items && item.items.length > 0) {
                    // 递归渲染子文件夹内容
                    renderSubTree(childrenContainer, item.items, path);
                } else {
                    // 空文件夹提示信息
                    const emptyFolderMessage = document.createElement('div');
                    emptyFolderMessage.className = 'empty-folder-message';
                    emptyFolderMessage.textContent = '此文件夹为空';
                    childrenContainer.appendChild(emptyFolderMessage);
                }
            }
            // 绑定点击事件
            itemNode.addEventListener('click', (e) => {
                if (item.type === 'folder') {
                    if (e.target.classList.contains('fa-chevron-right') || e.target.classList.contains('fa-chevron-down')) {
                        toggleFolder(itemNode);
                    } else {
                        selectPath(path);
                        document.querySelectorAll('.tree-item').forEach(node => {
                            node.classList.remove('active');
                        });
                        itemNode.classList.add('active');
                    }
                } else {
                    selectPath(path);
                    document.querySelectorAll('.tree-item').forEach(node => {
                        node.classList.remove('active');
                    });
                    itemNode.classList.add('active');
                }
            });
        });
    };

    renderSubTree(experimentsContainer, member.experiments);
}

// 切换文件夹展开/折叠状态
function toggleFolder(node) {
    // console.log('Toggle folder', node);
    const icon = node.querySelector('i:last-child');
    const folderIcon = node.querySelector('i:first-child'); // 获取文件夹图标
    const children = node.nextElementSibling; // 注意：这里使用nextElementSibling而不是folderChildren
    if (!children || !children.classList.contains('tree-children')) {
        console.error('No children container found for', node);
        return;
    }
    if (icon.classList.contains('fa-chevron-right')) {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-down');
        children.classList.add('expanded');
        folderIcon.classList.remove('fa-folder');
        folderIcon.classList.add('fa-folder-open');
    } else {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-right');
        children.classList.remove('expanded');
        folderIcon.classList.remove('fa-folder-open');
        folderIcon.classList.add('fa-folder');
    }
}

// 选择路径并更新内容视图
function selectPath(path) {
    currentPath = path;

    const normalizedPath = path.join('/');
    // console.log("选择路径时生成的路径:", normalizedPath);

    const treeNode = document.querySelector(`.tree-item[data-path="${normalizedPath}"]`);
    // console.log("查找的树节点:", treeNode);

    if (!currentOpenPanel) return;

    const contentView = document.getElementById(`member-panel-${currentOpenPanel.id}`).querySelector('.content-view');
    contentView.innerHTML = '';

    // 特殊处理成员根目录
    if (path.length === 1 && path[0] === currentOpenPanel.title) {
        const experiments = currentOpenPanel.experiments;
        if (experiments && experiments.length > 0) {
            renderFolderView(experiments, contentView);
        } else {
            contentView.innerHTML = `
                <div class="empty-state col-span-full">
                    <i class="fa fa-folder-open text-4xl mb-4 text-gray-400"></i>
                    <p>此成员暂无实验数据</p>
                </div>
            `;
        }
        updateTreeSelection(path);
        syncPanelHeights(); // 内容加载后同步高度
        return;
    }

    // 直接根据路径深度查找对应层级
    let currentItem = currentOpenPanel;
    for (let i = 0; i < path.length; i++) {
        const part = path[i];

        // 成员根目录（第一层）
        if (i === 0) {
            continue; // 已在上方处理
        }
        // 实验文件夹（第二层）
        else if (i === 1) {
            currentItem = currentOpenPanel.experiments.find(exp => exp.title === part);
        }
        // 子文件夹或文件（第三层及更深）
        else {
            if (currentItem && currentItem.items) {
                currentItem = currentItem.items.find(item => item.title === part);
            } else {
                currentItem = null;
                break;
            }
        }

        if (!currentItem) {
            break;
        }
    }

    if (!currentItem) {
        contentView.innerHTML = `
            <div class="empty-state col-span-full p-8 text-center">
                <i class="fa fa-exclamation-triangle text-5xl mb-4 text-gray-500"></i>
                <p class="text-xl font-medium text-gray-500 max-w-md mx-auto">未找到该内容</p>
            </div>
        `;
        updateTreeSelection(path);
        return;
    }

    // 根据找到的项目类型渲染视图
    if (currentItem.type === 'folder') {
        if (currentItem.items && currentItem.items.length > 0) {
            renderFolderView(currentItem.items, contentView);
        } else {
            contentView.innerHTML = `
                <div class="empty-state col-span-full p-8 text-center">
                    <i class="fa fa-folder text-5xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-medium text-gray-700 mb-2">此文件夹为空</h3>
                    <p class="text-gray-500 max-w-md mx-auto">该文件夹中没有包含任何文件或子文件夹</p>
                </div>
            `;
        }
    } else {
        renderFileView(currentItem, contentView);
    }

    updateTreeSelection(path);
    syncPanelHeights(); // 内容加载后同步高度
}

// 提取树选择逻辑为单独函数
function updateTreeSelection(path) {
    const treeNode = document.querySelector(`.tree-item[data-path="${path.join('/')}"]`);
    if (treeNode) {
        document.querySelectorAll('.tree-item').forEach(node => {
            node.classList.remove('active');
        });
        treeNode.classList.add('active');
        expandParentNodes(treeNode);
    }
}

// 渲染文件夹视图
function renderFolderView(items, container) {
    const folderContent = document.createElement('div');
    folderContent.className = 'folder-content';
    container.appendChild(folderContent);

    if (!items || items.length === 0) {
        folderContent.innerHTML = `
            <div class="empty-state col-span-full p-8 text-center">
                <i class="fa fa-folder text-5xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-medium text-gray-700 mb-2">此文件夹为空</h3>
                <p class="text-gray-500 max-w-md mx-auto">该文件夹中没有包含任何文件或子文件夹</p>
            </div>
        `;
        return;
    }

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'folder-item';
        const newPath = [...currentPath, item.title];
        const normalizedPath = newPath.join('/');
        // console.log("渲染文件夹视图时生成的路径:", normalizedPath);

        const { iconClass, iconColor } = getIconAndColor(item);

        itemElement.innerHTML = `
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center">
                    <i class="fa ${iconClass} ${iconColor}"></i>
                    <span class="ml-2">${item.title}</span>
                </div>
            </div>
        `;
        folderContent.appendChild(itemElement);

        // 绑定点击事件
        itemElement.addEventListener('click', () => {
            const newPath = [...currentPath, item.title];
            selectPath(newPath);

            // 优化路径格式匹配
            const normalizedPath = newPath.join('/');
            const treeNode = document.querySelector(`.tree-item[data-path="${normalizedPath}"]`);

            // console.log("点击了节点，查找路径:", normalizedPath, "找到节点:", treeNode);
            if (treeNode) {
                document.querySelectorAll('.tree-item').forEach(node => {
                    node.classList.remove('active');
                });
                treeNode.classList.add('active');
                expandParentNodes(treeNode);
            } else {
                // 处理节点未找到的情况（可选）
                console.warn("未找到匹配的树节点，路径:", normalizedPath);
                // 可以选择重新渲染树或检查路径生成逻辑
            }
        });
    });
}

// 展开所有父级节点
function expandParentNodes(node) {
    // console.log("展开父节点:", node);
    if (!node) return;

    // 确保当前节点是 tree-item
    if (!node.classList.contains('tree-item')) {
        node = node.closest('.tree-item');
    }

    let currentNode = node;
    let parentContainer = currentNode.parentElement;

    // 循环向上查找并展开父级文件夹
    while (parentContainer && parentContainer.classList.contains('tree-children')) {
        // 找到父级文件夹节点（tree-item）
        const parentFolder = parentContainer.previousElementSibling;

        if (parentFolder && parentFolder.classList.contains('tree-item')) {
            // 检查父文件夹是否处于折叠状态
            const toggleIcon = parentFolder.querySelector('i:last-child');
            if (toggleIcon && toggleIcon.classList.contains('fa-chevron-right')) {
                // 调用 toggleFolder 函数展开文件夹
                toggleFolder(parentFolder);
            }

            // 继续向上查找更高层级的父文件夹
            currentNode = parentFolder;
            parentContainer = currentNode.parentElement;
        } else {
            break; // 无法找到正确的父文件夹节点，退出循环
        }
    }
}

// 渲染文件视图
function renderFileView(file, container) {
    const fileContent = document.createElement('div');
    fileContent.className = 'file-content w-full';
    console.log("正在渲染文件视图:", file);
    // 获取文件图标和颜色
    const { iconClass, iconColor } = getIconAndColor(file);

    // 文件头部信息区域
    const headerHtml = `
        <div class="mb-4 flex justify-between items-center">
            <div class="flex items-center">
                <i class="fa ${iconClass} ${iconColor} mr-2"></i>
                <h3 class="font-medium">${file.title}</h3>
            </div>
            <div class="flex space-x-4">
                ${getFileActions(file)}
            </div>
        </div>
    `;

    // 根据文件类型渲染不同内容
    let contentHtml = '';

    if (isCodeFile(file.type)) {
        fetch(file.file)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`加载文件失败: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(content => {
                const codeView = fileContent.querySelector('.code-view');
                codeView.innerHTML = '';

                // 添加行号和代码内容
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    const lineEl = document.createElement('div');
                    lineEl.className = 'code-line';
                    const lineNumber = document.createElement('span');
                    lineNumber.className = 'line-number';
                    lineNumber.textContent = index + 1;

                    const lineContent = document.createElement('span');
                    lineContent.className = 'line-content';

                    const code = document.createElement('code');
                    code.className = 'language-' + file.type;
                    code.textContent = line;
                    lineContent.appendChild(code);

                    lineEl.appendChild(lineNumber);
                    lineEl.appendChild(lineContent);
                    codeView.appendChild(lineEl);

                    // 点击高亮效果
                    lineEl.addEventListener('click', () => {
                        document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active'));
                        lineEl.classList.add('active');
                    });

                    // 调用 highlight.js 语法高亮
                    if (window.hljs) hljs.highlightElement(code);
                });

                // 设置预览功能
                if (file.type === 'html') {
                    const toggleBtn = fileContent.querySelector('#toggle-preview');
                    const previewContainer = fileContent.querySelector('#preview-container');
                    const codeContainer = fileContent.querySelector('#code-container');
                    const previewFrame = fileContent.querySelector('#preview-frame');

                    toggleBtn.addEventListener('click', () => {
                        const isPreviewHidden = previewContainer.classList.contains('hidden');
                        previewContainer.classList.toggle('hidden');
                        codeContainer.classList.toggle('hidden');

                        toggleBtn.innerHTML = isPreviewHidden ?
                            '<i class="fa fa-code mr-1"></i> 代码' :
                            '<i class="fa fa-eye mr-1"></i> 预览';

                        if (isPreviewHidden) {
                            const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
                            doc.open();
                            doc.write(content);
                            doc.close();
                        }
                    });
                }
            })
            .catch(error => {
                console.error('加载文件时出错:', error);
                fileContent.querySelector('.code-view').innerHTML = `
                    <div class="text-red-500 p-4">加载文件失败: ${error.message}</div>
                `;
            });
        contentHtml = renderCodeFileContent(file);
    } else if (file.type === 'word') {
        contentHtml = renderWordDocContent(file);
    } else if (file.type === 'pdf') {
        contentHtml = renderPdfContent(file);
    } else if (file.type === 'image') {
        contentHtml = renderImageContent(file);
    } else {
        contentHtml = renderGenericFileContent(file);
    }

    // 组合完整的文件视图HTML
    fileContent.innerHTML = headerHtml + contentHtml;

    // 清空容器并添加文件内容
    container.innerHTML = '';
    container.appendChild(fileContent);
}

// 辅助函数：判断是否为代码文件
function isCodeFile(fileType) {
    return ['html', 'css', 'javascript', 'js', 'jsx', 'ts', 'tsx', 'json', 'php', 'python', 'markdown', 'md'].includes(fileType);
}

// 辅助函数：获取文件操作按钮
function getFileActions(file) {
    if (isCodeFile(file.type)) {
        let actions = '';

        // HTML文件添加预览切换按钮
        if (file.type === 'html') {
            actions += `
                <button id="toggle-preview" class="text-[--color-primary] hover:underline">
                    <i class="fa fa-eye mr-1"></i>预览
                </button>
            `;
        }

        // 添加在新标签页打开按钮
        actions += `
            <a href="${file.file}" target="_blank" class="text-[--color-primary] hover:underline">
                <i class="fa fa-external-link mr-1"></i>在新标签页打开
            </a>
            <a href="${file.file}" download class="text-[--color-primary] hover:underline">
                <i class="fa fa-download mr-1"></i> 下载
            </a>
        `;
        return actions;
    } else {
        // 非代码文件使用下载或查看按钮
        return `
            <a href="${file.file}" target="_blank" class="text-[--color-primary] hover:underline">
                <i class="fa ${file.action === 'download' ? 'fa-download' : 'fa-external-link'} mr-1"></i> 
                ${file.action === 'download' ? '下载文件' : '查看文件'}
            </a>
        `;
    }
}

// 辅助函数：渲染代码文件内容结构
function renderCodeFileContent(file) {
    return `
            <div class="flex flex-col w-full">
                <div class="w-full" id="code-container">
                    <div class="bg-gray-800 rounded-t-lg p-2 flex items-center">
                        <span class="text-gray-300 text-sm font-mono">${file.title}</span>
                    </div>
                    <pre class="code-view bg-gray-900 text-gray-100 rounded-b-lg p-4 overflow-x-auto">
                        <div class="text-center py-2">
                            <i class="fa fa-spinner fa-spin mr-2"></i> 加载中...
                        </div>
                    </pre>
                </div>
                ${file.type === 'html' ? `
                    <div class="w-full hidden" id="preview-container">
                        <div class="bg-gray-800 rounded-t-lg p-2 flex items-center">
                            <span class="text-gray-300 text-sm font-mono">预览</span>
                        </div>
                        <iframe id="preview-frame" class="w-full h-[calc(100vh-300px)] min-h-[500px] border border-gray-200 rounded-b-lg"></iframe>
                    </div>
                ` : ''}
            </div>
    `;
}

// 辅助函数：渲染Word文档内容
function renderWordDocContent(file) {
    return `
        <div class="p-8 bg-gray-50 rounded-lg text-center">
            <i class="fa fa-file-word-o text-4xl text-blue-500 mb-4"></i>
            <h3 class="text-xl font-medium mb-2">Word 文档</h3>
            <p class="text-gray-600 mb-6">Word文档需要下载后才能查看</p>
            <a href="${file.file}" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center">
                <i class="fa fa-download mr-2"></i> 下载文档
            </a>
        </div>
    `;
}

// 辅助函数：渲染PDF内容
function renderPdfContent(file) {
    return `
        <div class="p-8 bg-gray-50 rounded-lg text-center">
            <i class="fa fa-file-pdf-o text-4xl text-red-500 mb-4"></i>
            <h3 class="text-xl font-medium mb-2">PDF 文档</h3>
            <p class="text-gray-600 mb-6">点击下方按钮查看或下载PDF文件</p>
            <a href="${file.file}" target="_blank" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors inline-flex items-center">
                <i class="fa fa-external-link mr-2"></i> 查看PDF
            </a>
        </div>
    `;
}

// 辅助函数：渲染图片内容
function renderImageContent(file) {
    return `
        <div class="p-4 bg-gray-50 rounded-lg">
            <div class="text-center mb-4">
                <h3 class="text-lg font-medium">图片预览</h3>
            </div>
            <div class="flex justify-center">
                <img src="${file.file}" alt="${file.title}" class="max-w-full max-h-[500px] object-contain rounded-lg shadow-md">
            </div>
            <div class="mt-4 text-center">
                <a href="${file.file}" target="_blank" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center">
                    <i class="fa fa-external-link mr-2"></i> 在新标签页查看原图
                </a>
            </div>
        </div>
    `;
}

// 辅助函数：渲染通用文件内容
function renderGenericFileContent(file) {
    return `
        <div class="p-8 bg-gray-50 rounded-lg text-center">
            <i class="fa ${file.icon || 'fa-file'} text-4xl text-gray-500 mb-4"></i>
            <h3 class="text-xl font-medium mb-2">${getFileTypeTitle(file.type)}</h3>
            <p class="text-gray-600 mb-6">点击下方按钮${file.action === 'download' ? '下载' : '查看'}此文件</p>
            <a href="${file.file}" target="_blank" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center">
                <i class="fa ${file.action === 'download' ? 'fa-download' : 'fa-external-link'} mr-2"></i> 
                ${file.action === 'download' ? '下载文件' : '查看文件'}
            </a>
        </div>
    `;
}

// 辅助函数：获取文件类型标题
function getFileTypeTitle(fileType) {
    const titleMap = {
        'word': 'Word 文档',
        'pdf': 'PDF 文档',
        'excel': 'Excel 电子表格',
        'ppt': 'PowerPoint 演示文稿',
        'image': '图片文件',
        'video': '视频文件',
        'audio': '音频文件',
        'archive': '压缩文件',
        'markdown': 'Markdown 文档'
    };

    return titleMap[fileType] || `${fileType ? fileType.charAt(0).toUpperCase() + fileType.slice(1) : '未知'} 文件`;
}

// 辅助函数：HTML转义
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 提取图标和颜色设置逻辑为单独函数
function getIconAndColor(item) {
    let iconClass = item.icon || 'fa-file';
    let iconColor = '';

    if (item.type === 'folder') {
        iconClass = 'fa-folder';
        iconColor = 'text-[--color-secondary]';
    } else if (item.type === 'word') {
        iconClass = 'fa-file-word';
        iconColor = 'text-blue-500';
    } else if (item.type === 'html') {
        iconClass = 'fa-brands fa-html5';
        iconColor = 'text-[--morandi-gray]';
    } else if (item.type === 'css') {
        iconClass = 'fa-brands fa-css3';
        iconColor = 'text-[--morandi-purple]';
    } else if (item.type === 'javascript') {
        iconClass = 'fa-brands fa-js';
        iconColor = 'text-[--morandi-beige]';
    } else if (item.type === 'python') {
        iconClass = 'fa-brands fa-python';
        iconColor = 'text-blue-400';
    } else if (item.type === 'pdf') {
        iconClass = 'fa-file-pdf';
        iconColor = 'text-red-500';
    } else if (item.type === 'image') {
        iconClass = 'fa-file-image';
        iconColor = 'text-green-500';
    } else if (item.type === 'markdown') {
        iconClass = 'fa-markdown';
        iconColor = 'text-gray-700';
    } else if (item.type === 'json') {
        iconClass = 'fa-file-code';
        iconColor = 'text-purple-500';
    } else if (item.type === 'excel') {
        iconClass = 'fa-file-excel';
        iconColor = 'text-green-600';
    } else if (item.type === 'ppt') {
        iconClass = 'fa-file-powerpoint';
        iconColor = 'text-orange-500';
    } else if (item.type === 'archive') {
        iconClass = 'fa-file-archive';
        iconColor = 'text-gray-500';
    } else {
        iconClass = 'fa-file';
        iconColor = 'text-gray-400';
    }

    return { iconClass, iconColor };
}

// 同步左右两侧高度
function syncPanelHeights() {
    const panelContents = document.querySelectorAll('.panel-content');
    panelContents.forEach(panel => {
        const fileTree = panel.querySelector('.file-tree');
        const contentView = panel.querySelector('.content-view');

        if (fileTree && contentView) {
            // 检查当前屏幕宽度是否大于768px（非移动端）
            const isDesktop = window.innerWidth > 768;

            if (isDesktop) {
                // 桌面端：同步两侧高度
                const treeHeight = fileTree.offsetHeight;
                contentView.style.height = `${treeHeight}px`;
            } else {
                // 移动端：清除高度设置，使用CSS自动布局
                contentView.style.height = '';
            }
        }
    });
}

// 初始同步
document.addEventListener('DOMContentLoaded', syncPanelHeights);

// 窗口大小改变时同步
window.addEventListener('resize', syncPanelHeights);

// 面板内容加载完成后同步（例如文件树展开时）
document.addEventListener('click', (e) => {
    if (e.target.closest('.tree-item') || e.target.closest('.close-panel')) {
        // 延迟执行以确保DOM更新完成
        setTimeout(syncPanelHeights, 20);
    }
});

// 初始化：从JSON文件加载数据并渲染
async function initialize() {
    try {
        const jsonPath = 'experiments.json';
        await loadDirectoryData(jsonPath);

        const membersContainer = document.getElementById('members-container');
        membersContainer.innerHTML = '';

        if (directoryData.items && directoryData.items.length > 0) {
            renderMembersList(directoryData.items);
            console.log('目录初始化完成');
        } else {
            membersContainer.innerHTML = '<div class="text-gray-500 italic">暂无成员数据</div>';
        }

        // 添加日志确认初始化完成
        console.log('初始化完成，准备绑定事件');

        document.getElementById('root-folder').addEventListener('click', function() {
            const membersContainer = document.getElementById('members-container');
            directoryData.expanded = !directoryData.expanded;

            if (directoryData.expanded) {
                membersContainer.style.display = 'block';
                this.querySelector('i').classList.remove('fa-folder');
                this.querySelector('i').classList.add('fa-folder-open');
            } else {
                membersContainer.style.display = 'none';
                this.querySelector('i').classList.remove('fa-folder-open');
                this.querySelector('i').classList.add('fa-folder');
            }
        });
    } catch (error) {
        console.error('初始化失败:', error);
    }
}

// 启动应用
initialize();

// 示例：添加新成员
function addNewMember(memberData) {
    directoryData.items.push(memberData);
    initialize(); // 重新渲染整个目录
}

// 示例：添加新实验到成员
function addExperimentToMember(memberId, experimentData) {
    const member = directoryData.items.find(item => item.id === memberId);
    if (member) {
        member.experiments.push(experimentData);
        if (currentOpenPanel && currentOpenPanel.id === memberId) {
            renderFileTree(member, document.getElementById(`member-panel-${memberId}`).querySelector('.file-tree'));
        }
    }
}