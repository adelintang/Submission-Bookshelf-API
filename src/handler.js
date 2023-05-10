const { nanoid } = require('nanoid');
const books = require('./books');

const response = (status, { message, data }, statusCode, h) => {
  return h.response({
    status,
    message,
    data,
  }).code(statusCode);
};

const filteredBooks = (result) => {
  return result.reduce((acc, curr) => {
    acc.push({ id: curr.id, name: curr.name, publisher: curr.publisher });
    return acc;
  }, []);
};

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  if (!name) {
    return response('fail', { message: 'Gagal menambahkan buku. Mohon isi nama buku' }, 400, h);
  } else if (readPage > pageCount) {
    return response('fail', { message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount' }, 400, h);
  } else {
    books.push(newBook);
    return response('success', { message: 'Buku berhasil ditambahkan', data: { bookId: id } }, 201, h);
  }
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  if (name) {
    const result = books.filter((elem) => name.toLowerCase().split('').every((e) => `${elem.name}`.toLowerCase().includes(e)));
    const data = filteredBooks(result);
    return response('success', { data: { books: data } }, 200, h);
  } else if (reading) {
    const result = books.filter((book) => (book.reading === Boolean(Number(reading))));
    const data = filteredBooks(result);
    return response('success', { data: { books: data } }, 200, h);
  } else if (finished) {
    const result = books.filter((book) => book.finished === Boolean(Number(finished)));
    const data = filteredBooks(result);
    return response('success', { data: { books: data } }, 200, h);
  } else {
    const data = filteredBooks(books);
    return response('success', { data: { books: data } }, 200, h);
  }
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const book = books.find((item) => item.id === bookId);

  if (book !== undefined) return response('success', { data: { book } }, 200, h);
  return response('fail', { message: 'Buku tidak ditemukan' }, 404, h);
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const index = books.findIndex((item) => item.id === bookId);

  if (!name) {
    return response('fail', { message: 'Gagal memperbarui buku. Mohon isi nama buku' }, 400, h);
  } else if (readPage > pageCount) {
    return response('fail', { message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount' }, 400, h);
  } else if (index === -1) {
    return response('fail', { message: 'Gagal memperbarui buku. Id tidak ditemukan' }, 404, h);
  } else {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    };

    return response('success', { message: 'Buku berhasil diperbarui' }, 200, h);
  }
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const index = books.findIndex((item) => item.id === bookId);

  if (index === -1) {
    return response('fail', { message: 'Buku gagal dihapus. Id tidak ditemukan' }, 404, h);
  } else {
    books.splice(index, 1);
    return response('success', { message: 'Buku berhasil dihapus' }, 200, h);
  }
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};