# Git 推送指南

## 📋 推送步骤

### 1. 检查 Git 状态

```bash
git status
```

### 2. 添加文件到暂存区

**添加所有文件：**
```bash
git add .
```

**或选择性添加：**
```bash
git add src/
git add package.json
git add vite.config.js
# ... 添加其他需要的文件
```

### 3. 提交更改

```bash
git commit -m "feat: 修复JWT Token问题和菜单获取错误

- 修复JWT Token格式验证
- 增强错误处理和调试信息
- 修复菜单路由获取错误
- 添加详细的排查文档"
```

**提交信息格式建议：**
- `feat:` - 新功能
- `fix:` - 修复bug
- `docs:` - 文档更新
- `style:` - 代码格式调整
- `refactor:` - 代码重构
- `test:` - 测试相关
- `chore:` - 构建/工具相关

### 4. 添加远程仓库（如果还没有）

```bash
# 查看是否已有远程仓库
git remote -v

# 如果没有，添加远程仓库
git remote add origin https://github.com/your-username/your-repo.git
# 或使用 SSH
git remote add origin git@github.com:your-username/your-repo.git
```

### 5. 推送到远程仓库

**首次推送：**
```bash
git push -u origin main
```

**后续推送：**
```bash
git push
```

**推送到其他分支：**
```bash
git push origin branch-name
```

## 🔒 重要提示

### 1. 环境变量文件

`.env` 文件已添加到 `.gitignore`，不会被提交。这些文件包含敏感信息，不应该提交到 Git。

如果需要共享环境变量配置，请使用 `env.example` 文件。

### 2. 检查要提交的文件

在提交前，检查是否有敏感信息：

```bash
# 查看将要提交的文件
git status

# 查看文件内容（确认没有敏感信息）
git diff
```

### 3. 不要提交的文件

以下文件/目录不应该提交：
- `node_modules/` - 依赖包
- `dist/` - 构建产物
- `.env*` - 环境变量文件
- `*.log` - 日志文件
- `.idea/`, `.vscode/` - IDE 配置

## 📝 完整推送流程示例

```bash
# 1. 检查状态
git status

# 2. 添加文件
git add .

# 3. 提交
git commit -m "fix: 修复JWT Token验证和菜单获取问题"

# 4. 推送
git push
```

## 🔧 常见问题

### 问题 1: 推送被拒绝

**错误信息：**
```
! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'origin'
```

**解决方案：**
```bash
# 先拉取远程更改
git pull origin main

# 解决冲突后再次推送
git push
```

### 问题 2: 需要设置用户信息

**错误信息：**
```
*** Please tell me who you are.
```

**解决方案：**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 问题 3: 撤销最后一次提交

```bash
# 撤销提交但保留更改
git reset --soft HEAD~1

# 撤销提交并丢弃更改（谨慎使用）
git reset --hard HEAD~1
```

## 🚀 快速推送命令

```bash
# 一键推送（谨慎使用）
git add . && git commit -m "update" && git push
```

## 📚 更多 Git 命令

```bash
# 查看提交历史
git log

# 查看文件更改
git diff

# 创建新分支
git checkout -b feature/new-feature

# 切换分支
git checkout branch-name

# 合并分支
git merge branch-name

# 查看远程仓库
git remote -v

# 更新远程仓库地址
git remote set-url origin new-url
```

## ⚠️ 注意事项

1. **提交前检查**：确保没有提交敏感信息（密码、Token、API密钥等）
2. **提交信息**：写清楚有意义的提交信息，方便后续查看历史
3. **分支管理**：重要功能建议创建新分支开发
4. **定期推送**：不要积累太多未推送的提交
