/**
 * @typedef {{
 *  id: number,
 *  title: string,
 *  author: string,
 *  year: number,
 *  isComplete: boolean,
 * }} BookData
 *
 * @typedef {{ books: BookData[], filteredBooks: BookData[] }} BookState
 *
 * @typedef {{
 *    type?: 'ADD_BOOK' | 'DELETE_BOOK' | 'UPDATE_BOOK' | 'FILTER_BOOK',
 *    payload?: string | BookData,
 * }} BookStateAction
 */

"use strict";

const STORAGE_KEY = "BOOK_DATA";
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const form = document.getElementById("form");
const idForm = document.getElementById("book-id");
const titleForm = document.getElementById("title");
const authorForm = document.getElementById("author");
const yearForm = document.getElementById("year");
const addButton = document.getElementById("add-button");
const resetButton = document.getElementById("reset-button");
const checkForm = document.getElementById("complete-check");
const uncompleteContainer = document.getElementById("uncomplete");
const completedContainer = document.getElementById("completed");
const inputTabs = [...document.querySelectorAll(".tabs > .tab > input")];
const contents = [...document.querySelectorAll(".container[data-tab]")];

/**
 * Check localStorage supported or not
 * @returns {boolean}
 */
const isStorageExist = function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
};

/**
 * @param {BookData[]} data
 * @returns {void}
 */
const refreshData = function addBook(data) {
  if (isStorageExist()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

/**
 * Fundamentals of Redux Course from Dan Abramov
 * https://egghead.io/courses/fundamentals-of-redux-course-from-dan-abramov-bd5cc867
 *
 * @param {BookState} state
 * @param {BookStateAction} action
 * @returns {BookState}
 */
const reducer = (state = { books: [], filteredBooks: [] }, action) => {
  switch (action.type) {
    case "ADD_BOOK":
      state.books = [action.payload, ...state.books];
      refreshData(state.books);
      return state;
    case "DELETE_BOOK":
      state.books = state.books.filter((book) => book.id !== action.payload.id);
      refreshData(state.books);
      return state;
    case "UPDATE_BOOK":
      state.books = state.books.map((book) =>
        book.id === action.payload.id ? action.payload : book
      );
      refreshData(state.books);
      return state;
    case "FILTER_BOOK":
      state.filteredBooks = state.books.filter(
        ({ title, author, year }) =>
          title.toLowerCase().includes(action.payload.toLowerCase()) ||
          author.toLowerCase().includes(action.payload.toLowerCase()) ||
          year.toString().includes(action.payload)
      );
      return state;
    default:
      return state;
  }
};

/**
 * Fundamentals of Redux Course from Dan Abramov
 * https://egghead.io/courses/fundamentals-of-redux-course-from-dan-abramov-bd5cc867
 *
 * @param {(state: BookData[], action: BookStateAction) => BookState} reducer
 * @returns {{
 *  getState: () => BookState,
 *  subscribe: (param: () => void) => void,
 *  dispatch: (action: BookStateAction) => void
 * }}
 */
const createStore = function createStore(reducer) {
  let state = {
    books: [],
    filteredBooks: []
  };
  let listeners = [];

  if (isStorageExist()) {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) state.books = JSON.parse(storedData);
  }

  /**
   * @returns {BookData[]}
   */
  const getState = function getState() {
    return state;
  };

  /**
   * @param {BookStateAction} action
   * @returns {void}
   */
  const dispatch = function dispatch(action) {
    state = reducer(state, action);
    listeners.forEach((listener) => listener());
  };

  /**
   * @param {() => any} listener
   * @returns {void}
   */
  const subscribe = function subscribe(listener) {
    listeners.push(listener);
  };

  dispatch({});

  return { getState, subscribe, dispatch };
};

const { getState, subscribe, dispatch } = createStore(reducer);

const filterBooks = function filterBooks() {
  dispatch({ type: "FILTER_BOOK", payload: searchInput.value });
};

/**
 * Ref: Masonry style layout with CSS Grid
 * https://medium.com/@andybarefoot/a-masonry-style-layout-using-css-grid-8c663d355ebb
 *
 * @param {Element} item
 * @returns {void}
 */
const resizeGridItem = function resizeGridItem(item) {
  const grid = document.querySelector(".grid");
  const rowHeight = parseInt(
    window.getComputedStyle(grid).getPropertyValue("grid-auto-rows"),
    10
  );
  const rowGap = parseInt(
    window.getComputedStyle(grid).getPropertyValue("grid-row-gap"),
    10
  );
  const rowSpan = Math.ceil(
    (item.querySelector(".content").getBoundingClientRect().height + rowGap) /
      (rowHeight + rowGap)
  );

  item.style.gridRowEnd = `span ${Number(rowSpan)}`;
};

/**
 * Ref: Masonry style layout with CSS Grid
 * https://medium.com/@andybarefoot/a-masonry-style-layout-using-css-grid-8c663d355ebb
 *
 * @returns {void}
 */
const resizeAllGridItems = function resizeAllGridItems() {
  const allItems = document.querySelectorAll(".item");
  allItems.forEach((item) => {
    resizeGridItem(item);
  });
};

/**
 * @param {string} id
 * @returns {Element}
 */
const getContentTab = function getContentTab(id) {
  return contents.find((content) => content.dataset.tab === id);
};

/**
 * @returns {void}
 */
const tabController = function tabController() {
  const test = inputTabs.find((inputTab) => inputTab.checked);
  const check = getContentTab(test.id);
  check.classList.remove("hidden");
};

/**
 *
 * @param {BookData} data
 */
const itemComponent = function itemComponent(data) {
  const { id, title, author, year, isComplete } = data;
  const item = document.createElement("div");
  item.classList.add("item");

  const content = document.createElement("div");
  content.classList.add("content");
  item.appendChild(content);

  const inner = document.createElement("div");
  inner.classList.add("inner");
  content.appendChild(inner);

  const h2 = document.createElement("h2");
  h2.textContent = title;
  inner.appendChild(h2);

  const pAuthor = document.createElement("p");
  pAuthor.textContent = author;
  inner.appendChild(pAuthor);

  const pYear = document.createElement("p");
  pYear.textContent = year;
  inner.appendChild(pYear);

  const actions = document.createElement("div");
  actions.classList.add("action-container");
  content.appendChild(actions);

  const positiveButton = document.createElement("button");
  positiveButton.classList.add("action-button");
  positiveButton.ariaLabel = "Action Button";
  actions.appendChild(positiveButton);

  const actionIcon = document.createElement("i");
  positiveButton.appendChild(actionIcon);

  if (isComplete) {
    positiveButton.classList.add("undo-button");
    actionIcon.classList.add("fas", "fa-undo");
  } else {
    positiveButton.classList.add("check-button");
    actionIcon.classList.add("far", "fa-check-square");
  }

  const editButton = document.createElement("button");
  editButton.classList.add("action-button", "edit-button");
  editButton.ariaLabel = "Edit Button";
  actions.appendChild(editButton);

  const editIcon = document.createElement("i");
  editIcon.classList.add("far", "fa-edit");
  editButton.appendChild(editIcon);

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("action-button", "trash-button");
  deleteButton.ariaLabel = "Delete Button";
  actions.appendChild(deleteButton);

  const trashIcon = document.createElement("i");
  trashIcon.classList.add("far", "fa-trash-alt");
  deleteButton.appendChild(trashIcon);

  positiveButton.addEventListener("click", () => {
    dispatch({
      type: "UPDATE_BOOK",
      payload: { ...data, isComplete: !isComplete }
    });
  });

  editIcon.addEventListener("click", () => {
    idForm.value = id;
    titleForm.value = title;
    authorForm.value = author;
    yearForm.value = year;
    checkForm.checked = isComplete;
    addButton.textContent = "Update";
  });

  deleteButton.addEventListener("click", () => {
    const isAgree = window.confirm(
      "Delete Book? Book will permanently deleted."
    );

    if (isAgree) dispatch({ type: "DELETE_BOOK", payload: data });
  });

  return item;
};

const render = function render() {
  /**
   * @param {HTMLElement} element
   * @returns {void}
   */
  const removeElementChilds = async function removeElementChields(element) {
    while (element.firstChild) {
      element.removeChild(element.lastChild);
    }
  };

  Promise.all([
    removeElementChilds(completedContainer),
    removeElementChilds(uncompleteContainer)
  ])
    .then(() => {
      const { books, filteredBooks } = getState();
      const data = filteredBooks.length > 0 ? filteredBooks : books;
      data.forEach((book) => {
        if (book.isComplete) completedContainer.prepend(itemComponent(book));
        else uncompleteContainer.prepend(itemComponent(book));
      });

      resizeAllGridItems();
    })
    .catch((err) => console.log(err));
};

tabController();
subscribe(render);
render();

window.addEventListener("load", resizeAllGridItems);
window.addEventListener("resize", resizeAllGridItems);

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  filterBooks();
});

searchInput.addEventListener("input", () => {
  filterBooks();
});

inputTabs.forEach((inputTab) => {
  inputTab.addEventListener("change", () => {
    contents.forEach((content) => {
      if (content.dataset.tab !== inputTab.id) content.classList.add("hidden");
    });

    getContentTab(inputTab.id).classList.remove("hidden");
    resizeAllGridItems();
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const bookId = Number(formData.get("book_id"));
  const payload = {
    id: bookId <= 0 ? Date.now() : bookId,
    title: formData.get("title"),
    author: formData.get("author"),
    year: formData.get("year"),
    isComplete: formData.get("complete_check") ? true : false
  };

  if (bookId <= 0) dispatch({ payload, type: "ADD_BOOK" });
  else {
    dispatch({ payload, type: "UPDATE_BOOK" });
  }

  form.reset();
  idForm.value = "0";
  addButton.textContent = "Add";
});

resetButton.addEventListener("click", () => {
  addButton.textContent = "Add";
});
