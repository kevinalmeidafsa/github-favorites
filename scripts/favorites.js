import { GithubUser } from "./GithubUser.js";

class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username);

      if (userExists) {
        throw new Error("Usuário já adicionado!");
      }

      const githubUser = await GithubUser.search(username);
      if (githubUser.login === undefined) {
        throw new Error("Usuário não encontrado!");
      }
      this.entries = [githubUser, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
      return;
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );
    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector("table tbody");
    this.update();
    this.onadd();
  }

  onadd() {
    const addButton = this.root.querySelector(".input-search button");
    addButton.onclick = () => {
      const { value } = this.root.querySelector(".input-search input");

      this.add(value);
    };
  }

  update() {
    this.removeAllRow();

    if (this.entries.length === 0) {
      this.tbody.append(this.listIsEmpty());
    }

    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `Foto do perfil de ${user.name}`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Deseja realmente remover?");
        if (isOk) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
    <td colspan="2" class="user">
      <img
        src="https://github.com/kevinalmeidafsa.png"
        alt="Foto do perfil de kevin"
      />
      <a href="https://github.com/kevinalmeidafsa" target="_blank">
        <p>Kevin Almeida</p>
        <span>kevinalmeidafsa</span>
      </a>
    </td>
    <td class="repositories">52</td>
    <td class="followers">1139</td>
    <td>
      <button class="remove">Remover</button>
    </td>`;

    return tr;
  }

  removeAllRow() {
    this.tbody.querySelectorAll("tr").forEach((row) => {
      row.remove();
    });
  }

  listIsEmpty() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td colspan="9" class="empty-wrapper"><div><img class="image-empty" src="./assets/Estrela.svg"/><span class="text-empty">Nenhum favorito ainda<span></div></td>
      `;

    return tr;
  }
}
