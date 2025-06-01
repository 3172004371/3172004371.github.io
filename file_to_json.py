import os
import json

# 文件类型映射
file_type_mapping = {
    '.doc': 'word', '.docx': 'word',
    '.html': 'html', '.htm': 'html',
    '.py': 'python',
    '.js': 'javascript',
    '.css': 'css',
    '.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.gif': 'image', '.svg': 'image',
    '.pdf': 'pdf',
    '.txt': 'text', '.md': 'markdown',
    '.xls': 'excel', '.xlsx': 'excel',
    '.ppt': 'ppt', '.pptx': 'ppt',
    '.json': 'json', '.xml': 'xml', '.yaml': 'yaml', '.yml': 'yaml',
    '.zip': 'archive', '.rar': 'archive', '.gz': 'archive'
}

# 图标映射
icon_mapping = {
    'word': 'fa-file-word-o',
    'html': 'fa-file-code-o',
    'python': 'fa-file-code-o',
    'javascript': 'fa-file-code-o',
    'css': 'fa-file-code-o',
    'image': 'fa-file-image-o',
    'pdf': 'fa-file-pdf-o',
    'text': 'fa-file-text-o',
    'markdown': 'fa-file-text-o',
    'excel': 'fa-file-excel-o',
    'ppt': 'fa-file-powerpoint-o',
    'json': 'fa-file-code-o',
    'xml': 'fa-file-code-o',
    'yaml': 'fa-file-code-o',
    'archive': 'fa-file-archive-o',
    'other': 'fa-file-o',
    'folder': 'fa-folder-o'
}

# 操作映射
action_mapping = {
    'word': 'download',
    'pdf': 'download',
    'excel': 'download',
    'ppt': 'download',
    'archive': 'download',
    'text': 'download',
    'markdown': 'download',
    'css': 'download',
    'javascript': 'download',
    'python': 'download',
    'html': 'external',
    'image': 'external',
    'json': 'download',
    'xml': 'download',
    'yaml': 'download',
    'other': 'download',
    'folder': 'none'
}

def process_all_directories(root_folder):
    all_data = []
    member_counter = 0

    # 获取并排序成员文件夹
    root_dirs = [
        os.path.join(root_folder, d)
        for d in os.listdir(root_folder)
        if os.path.isdir(os.path.join(root_folder, d)) and d != '.idea'
    ]
    root_dirs.sort()

    for root_dir in root_dirs:
        member_counter += 1
        member_id = str(member_counter)  # 使用字符串类型的ID
        member_name = os.path.basename(root_dir)

        # 创建成员对象
        member = {
            'id': member_id,
            'title': member_name,
            'type': "member",
            'expanded': False,
            'experiments': []
        }

        # 处理成员文件夹下的所有内容
        experiment_counter = 0
        items = os.listdir(root_dir)
        items.sort()
        for item in items:
            item_path = os.path.join(root_dir, item)
            if item == '.idea':
                continue

            if os.path.isdir(item_path):
                experiment_counter += 1
                experiment_id = f"{member_id}-{experiment_counter}"

                # 创建实验对象
                experiment = {
                    'id': experiment_id,
                    'title': item,
                    'type': "folder",
                    'expanded': False,
                    'memberId': member_id,
                    'folderPath': f"{member_name}/{item}",
                    'items': []
                }

                # 递归处理实验文件夹中的内容
                process_sub_directory(item_path, experiment['items'], member_name, f"{member_name}/{item}", experiment_id)

                # 添加实验到成员
                member['experiments'].append(experiment)

            # 添加根目录中的文件
            else:
                ext = os.path.splitext(item)[1].lower()
                file_type = file_type_mapping.get(ext, 'other')

                # 创建文件对象
                file_item = {
                    'type': file_type,
                    'title': item,
                    'file': f"experiments/{member_name}/{item}",
                    'icon': icon_mapping.get(file_type, icon_mapping['other']),
                    'action': action_mapping.get(file_type, action_mapping['other']),
                    'path': f"{member_name}/{item}"
                }

                # 将文件添加到成员的实验列表
                member['experiments'].append(file_item)

        # 添加成员到结果列表
        all_data.append(member)

    return all_data

def process_sub_directory(dir_path, parent_items, member_name, parent_path, parent_id):
    """递归处理目录，构建嵌套的文件夹结构"""
    # 获取目录下的所有内容并排序
    items = os.listdir(dir_path)
    items.sort()

    subfolder_counter = 0
    for item in items:
        item_path = os.path.join(dir_path, item)
        if item == '.idea':
            continue

        # 构建完整路径
        full_path = f"{parent_path}/{item}" if parent_path else item

        if os.path.isdir(item_path):
            subfolder_counter += 1
            # 创建文件夹对象
            folder_item = {
                'id': f"{parent_id}-{subfolder_counter}",
                'title': item,
                'type': 'folder',
                'file': f"experiments/{member_name}/{full_path}",
                'icon': icon_mapping['folder'],
                'action': action_mapping['folder'],
                'path': f"{member_name}/{full_path}",
                'expanded': False,
                'folderPath': f"{member_name}/{full_path}",
                'items': []  # 文件夹包含的子项
            }

            # 递归处理子目录
            process_sub_directory(item_path, folder_item['items'], member_name, full_path, f"{parent_id}-{subfolder_counter}")

            # 将文件夹添加到父级的items列表
            parent_items.append(folder_item)
        else:
            # 处理文件
            ext = os.path.splitext(item)[1].lower()
            file_type = file_type_mapping.get(ext, 'other')

            # 创建文件对象
            file_item = {
                'type': file_type,
                'title': item,
                'file': f"experiments/{full_path}",
                'icon': icon_mapping.get(file_type, icon_mapping['other']),
                'action': action_mapping.get(file_type, action_mapping['other']),
                'path': f"{full_path}"
            }

            # 将文件添加到父级的items列表
            parent_items.append(file_item)

if __name__ == "__main__":
    root_folder = "E:/study/CodeRole/CodeWeb/final_assignment/experiments"
    output_file = "experiments.json"

    if not os.path.exists(root_folder):
        print(f"错误：文件夹 '{root_folder}' 不存在")
    else:
        file_data = process_all_directories(root_folder)

        # 保存为JSON文件
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(file_data, f, ensure_ascii=False, indent=2)

        print(f"文件信息已写入 {output_file}")