import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import type { Post } from '../types';

const POSTS_PER_PAGE = 12;

// Кастомный хук для управления логикой постов: загрузка, фильтрация, пагинация.
const usePosts = (searchQuery: string) => {
  // Состояния:
  const [allPosts, setAllPosts] = useState<Post[]>([]); // Хранит ВСЕ посты, загруженные с API.
  const [posts, setPosts] = useState<Post[]>([]); // Посты, отображаемые на текущей странице.
  const [page, setPage] = useState(1); // Текущая страница для пагинации.
  const [hasMore, setHasMore] = useState(true); // Есть ли еще посты для загрузки.
  const [loading, setLoading] = useState(true); // Статус первоначальной загрузки.
  const [error, setError] = useState<string | null>(null); // Сообщение об ошибке.

  // useEffect для первоначальной загрузки всех постов с API.
  // Запускается только один раз при монтировании компонента, т.к. массив зависимостей пуст.
  useEffect(() => {
    const fetchAllPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Загружаем все 100 постов с сервера.
        const response = await axios.get<Post[]>('https://jsonplaceholder.typicode.com/posts');
        // Сохраняем посты в их оригинальном виде.
        setAllPosts(response.data);
      } catch (e) {
        setError('Не удалось загрузить посты.');
        console.error('Ошибка при загрузке всех постов:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, []);

  // useMemo для мемоизации отфильтрованного списка постов.
  // Фильтрация происходит на клиенте по заголовку и телу поста.
  // Пересчитывается только при изменении `allPosts` или `searchQuery`.
  const filteredPosts = useMemo(() => {
    if (!searchQuery) {
      return allPosts; // Если поиск пуст, возвращаем все посты.
    }
    return allPosts.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.body.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPosts, searchQuery]);

    // Эффект для инициализации и сброса пагинации при изменении отфильтрованных постов.
  // Запускается, когда пользователь вводит новый поисковый запрос.
  useEffect(() => {
    setPage(1); // Сбрасываем на первую страницу.
    setPosts([]); // Очищаем текущий список постов.
    // Загружаем первую порцию отфильтрованных постов.
    const newPosts = filteredPosts.slice(0, POSTS_PER_PAGE);
    setPosts(newPosts);
    // Проверяем, есть ли еще посты для загрузки.
    setHasMore(filteredPosts.length > POSTS_PER_PAGE);
  }, [filteredPosts]);

  // Функция для загрузки следующей "страницы" постов.
  // Вызывается Intersection Observer'ом при прокрутке.
  const loadMore = () => {
    // Проверяем, есть ли еще что загружать и не идет ли уже загрузка.
    if (!hasMore || loading) return;

    // Вычисляем следующую страницу.
    const nextPage = page + 1;
    const start = page * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;

    // Получаем следующую порцию постов из отфильтрованного списка.
    const newPosts = filteredPosts.slice(start, end);

    // Добавляем новые посты к существующим.
    setPosts(prevPosts => [...prevPosts, ...newPosts]);
    // Обновляем страницу.
    setPage(nextPage);
    // Проверяем, остались ли еще посты после текущей загрузки.
    setHasMore(filteredPosts.length > end);
  };

  return { loading, error, posts, hasMore, loadMore };
};

export default usePosts;
