# 📽 Demo Video
[Watch the demo video on Google Drive](https://drive.google.com/file/d/1jZTeR_HkqLg2Phm1TWYFF-1SLVOB_XSG/view?usp=sharing)

# 2D Metaverse Space

An open-source virtual space platform built with Turborepo, React.js, and TypeScript.

##  Inspiration

This project is inspired by popular platforms like **[Gather Town](https://gather.town)**.

##  Features

- **Real-time Communication**: Built-in WebSocket support
- **Space Management**: Multiple virtual spaces with user presence
- **Monorepo Structure**: Powered by [Turborepo](https://turbo.build/repo)
- **Full-Stack Architecture**:
  - React.js frontend application
  - WebSocket server
  - Node.js express backend
  - Postgress Database

## 🛠️ Installation

### Running Locally

1. Clone the repository:
    ```bash
    git clone https://github.com/Aman-Rathee/2D-Space.git
    ```

2. Navigate to the project directory:
    ```bash
    cd 2D-Space
    ```
    
3. Install dependencies:
    
    ```bash
    pnpm install
    ```

4. Start development:
    
    ```bash
    pnpm dev
    ```


## 📁 Project Structure
    
This repository is structured as follows:
    
```
    ├── apps
    │   └──
    │       ├── frontend
    │       ├── https
    │       └── ws
    └── packages
        └── db
```    


| Path                  | Description                               |
| --------------------- | ----------------------------------------  |
| `apps/frontent`       | The React.js application for the website. |
| `apps/https`          | The Node.js express backend.              |
| `apps/ws`             | The WebSocket server.                     |
| `packages/db`         | The PostgreSQL Database.                  |



## Contributing
Thanks for your interest in contributing to 2D Metaverse Space. We're happy to have you here.

### To contribute follow these steps:

1. [Fork the repository](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo).

2. Clone the fork to your local machine:

```bash
git clone https://github.com/<your username>/2D-Space.git
cd 2D-Space
```

3. Create a new branch

```bash
git checkout -b feature/fooBar
```

4. Make your changes and commit them

```bash
git commit -am 'Add fooBar feature'
```

5. Push to the branch

```bash
git push origin feature/fooBar
```

6. Go to [the repository](https://github.com/Aman-Rathee/2D-Space/pulls) and [make a Pull Request](https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

---
We hope you enjoy building with **2D Metaverse Space**!
