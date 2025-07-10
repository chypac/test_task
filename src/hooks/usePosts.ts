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

  // Загружаем все посты один раз при монтировании
  useEffect(() => {
    const fetchAllPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<Post[]>('https://jsonplaceholder.typicode.com/posts');
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

  // Фильтруем посты на клиенте, когда меняется поисковый запрос или основной список постов
  const filteredPosts = useMemo(() => {
    if (!searchQuery) {
      return allPosts;
    }
    return allPosts.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.body.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPosts, searchQuery]);

  // Инициализируем и сбрасываем пагинацию при изменении отфильтрованного списка
  useEffect(() => {
    setPage(1);
    const newPosts = filteredPosts.slice(0, POSTS_PER_PAGE);
    setPosts(newPosts);
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

// A trivial comment to force Git to recognize changes.
