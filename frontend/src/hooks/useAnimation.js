import { useEffect, useState, useRef } from 'react';

export const useMounted = (delay = 100) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, []);
  return mounted;
};

export const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
};

export const fadeUp = (visible, delay = 0) => ({
  opacity: visible ? 1 : 0,
  transform: visible ? 'translateY(0)' : 'translateY(30px)',
  transition: `all 0.6s ease ${delay}ms`
});

export const fadeIn = (visible, delay = 0) => ({
  opacity: visible ? 1 : 0,
  transition: `all 0.6s ease ${delay}ms`
});

export const slideLeft = (visible, delay = 0) => ({
  opacity: visible ? 1 : 0,
  transform: visible ? 'translateX(0)' : 'translateX(-20px)',
  transition: `all 0.5s ease ${delay}ms`
});