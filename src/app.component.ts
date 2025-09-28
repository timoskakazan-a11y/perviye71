import { Component, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';

interface ValueCard {
  icon: string;
  title: string;
  description: string;
}

interface Project {
  imageUrl: string;
  title: string;
  description:string;
}

interface NewsItem {
  id?: string;
  date: string;
  title: string;
  content: string; // Short summary
  fullContent: string; // Full article content (HTML)
  imageUrl?: string;
}

interface Photo {
  imageUrl: string;
  alt: string;
}

interface Candidate {
  id: number;
  name: string;
  photoUrl: string;
  slogan: string;
  votes: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
})
export class AppComponent implements OnInit {
  schoolName = "МБОУ №71 города Казани";
  teamName = "Чилловые ребятки";
  isMenuOpen = signal(false);
  currentPage = signal<'main' | 'voting'>('main');
  isStandalone = signal(false);
  showOpenInAppModal = signal(false);

  // Election signals
  hasVoted = signal(false);
  candidates = signal<Candidate[]>([
    { id: 1, name: 'Динара', photoUrl: '', slogan: 'За лучшее будущее!', votes: 0 },
  ]);

  totalVotes = computed(() => {
    return this.candidates().reduce((acc, candidate) => acc + candidate.votes, 0);
  });

  constructor() {
    if (typeof window !== 'undefined') {
        this.isStandalone.set(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('school71-election-voted');
      localStorage.removeItem('school71-election-votes');
    }
    this.checkVotingStatus();
  }

  ngOnInit(): void {
    // Add a delay for the splash screen animations to play and content to load
    setTimeout(() => {
      const splashScreen = document.getElementById('splash-screen');
      if (splashScreen) {
        splashScreen.classList.add('loaded');
        // Optional: Remove from DOM after transition for cleanliness
        setTimeout(() => {
            if (splashScreen.parentNode) {
                splashScreen.parentNode.removeChild(splashScreen);
            }
        }, 500); // Should match CSS transition duration
      }
    }, 2500); // Total splash screen time

    // Show "Open in App" modal on mobile browsers after a delay
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && typeof localStorage !== 'undefined') {
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      const dismissed = localStorage.getItem('school71-dismiss-open-app-modal') === 'true';

      if (!this.isStandalone() && isMobile && !dismissed) {
        setTimeout(() => {
          this.showOpenInAppModal.set(true);
        }, 5000); // 5 second delay
      }
    }
  }

  checkVotingStatus(): void {
    if (typeof localStorage === 'undefined') return;

    const voted = localStorage.getItem('school71-election-voted');
    if (voted === 'true') {
      this.hasVoted.set(true);
    } else {
      this.hasVoted.set(false);
    }

    const savedVotes = localStorage.getItem('school71-election-votes');
    if (savedVotes) {
        try {
            const votesData: {id: number, votes: number}[] = JSON.parse(savedVotes);
            this.candidates.update(currentCandidates =>
                currentCandidates.map(candidate => {
                    const savedCandidate = votesData.find(c => c.id === candidate.id);
                    return savedCandidate ? { ...candidate, votes: savedCandidate.votes } : candidate;
                })
            );
        } catch (e) {
            console.error("Could not parse saved votes", e);
        }
    } else {
        // If no saved votes, ensure all votes are 0
        this.candidates.update(currentCandidates =>
            currentCandidates.map(candidate => ({ ...candidate, votes: 0 }))
        );
    }
  }

  toggleMenu(): void {
    this.isMenuOpen.update(value => !value);
  }

  showVotingPage(): void {
    this.currentPage.set('voting');
    this.closeNews(); // Close news modal if it's open
    window.scrollTo(0, 0); // Scroll to top
  }

  showMainPage(): void {
    this.currentPage.set('main');
    window.scrollTo(0, 0); // Scroll to top
  }
  
  openInApp(): void {
    window.location.href = 'web+dvizhenie71://open';
  }

  dismissOpenInAppModal(remember: boolean): void {
    this.showOpenInAppModal.set(false);
    if (remember && typeof localStorage !== 'undefined') {
        localStorage.setItem('school71-dismiss-open-app-modal', 'true');
    }
  }

  vote(candidateId: number): void {
    if (this.hasVoted() || typeof localStorage === 'undefined') return;

    this.candidates.update(currentCandidates => {
        const newCandidates = currentCandidates.map(c =>
            c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
        );
        const votesToSave = newCandidates.map(({id, votes}) => ({id, votes}));
        localStorage.setItem('school71-election-votes', JSON.stringify(votesToSave));
        return newCandidates;
    });

    this.hasVoted.set(true);
    localStorage.setItem('school71-election-voted', 'true');
  }

  values = signal<ValueCard[]>([
    {
      icon: 'M13 10V3L4 14h7v7l9-11h-7z', // Represents energy, action
      title: 'Патриотизм и историческая память',
      description: 'Мы любим свою Родину, изучаем её историю и гордимся её достижениями.',
    },
    {
      icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', // Represents kindness, volunteering
      title: 'Добро и справедливость',
      description: 'Мы помогаем тем, кто нуждается в помощи, и стремимся сделать мир лучше.',
    },
    {
      icon: 'M20.59 12l-3.32-3.32a.75.75 0 00-1.06 1.06L17.94 11H6.06l1.72-1.72a.75.75 0 10-1.06-1.06L3.41 12l3.32 3.32a.75.75 0 001.06-1.06L6.06 13h11.88l-1.72 1.72a.75.75 0 101.06 1.06L20.59 12z', // Represents mutual assistance
      title: 'Взаимопомощь и взаимоуважение',
      description: 'Мы ценим каждого, уважаем чужое мнение и всегда готовы прийти на помощь.',
    },
    {
      icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z', // Represents creativity, ideas
      title: 'Крепкая семья',
      description: 'Семья - наша главная опора. Мы ценим семейные традиции и создаем новые.',
    },
  ]);

  projects = signal<Project[]>([
    {
      imageUrl: 'https://i.postimg.cc/VNMsVY8c/A4-22.png',
      title: 'Открыт набор в Движение',
      description: 'Хочешь найти друзей, реализовать свои идеи и сделать мир лучше? Присоединяйся к нам! Мы ждём самых активных, творческих и неравнодушных ребят.',
    },
  ]);

  photos = signal<Photo[]>([]);

  news = signal<NewsItem[]>([
    {
      id: 'election-announcement',
      date: 'Важно',
      title: 'Скоро выборы Председателя Совета Первых!',
      content: 'Прими участие в жизни школы и выбери своего лидера! Голосование уже началось. Узнай больше о кандидатах и сделай свой выбор.',
      imageUrl: 'https://i.postimg.cc/3NgSVY5r/Group-299.png',
      fullContent: `
        <p><strong>Внимание, активисты!</strong></p>
        <p>Настало время одного из самых важных событий в жизни нашего первичного отделения — выборов Председателя Совета Первых! Это уникальная возможность для каждого из вас повлиять на будущее Движения в нашей школе.</p>
        <h3>Кто может стать Председателем?</h3>
        <p>Председатель — это не просто должность, это лидер, который будет представлять интересы всех участников, вдохновлять на новые проекты и вести команду к успеху. Кандидаты уже представили свои программы и готовы к работе.</p>
        <h3>Почему важно голосовать?</h3>
        <ul>
          <li>Ваш голос определяет, кто будет направлять нашу деятельность в следующем году.</li>
          <li>Это проявление вашей активной гражданской позиции.</li>
          <li>Вместе мы выбираем лучшее будущее для нашего отделения!</li>
        </ul>
        <p>Ознакомьтесь с кандидатами, их идеями и слоганами. Ваш выбор имеет значение! Нажмите на кнопку ниже, чтобы перейти на страницу голосования и поддержать своего кандидата.</p>
      `
    },
    {
      date: 'Актуально',
      title: 'Ведётся активный набор в Движение!',
      content: 'Хочешь найти друзей, реализовать свои идеи и сделать мир лучше? Стань частью нашей команды! Узнай больше, кликнув на эту новость.',
      imageUrl: 'https://i.postimg.cc/VNMsVY8c/A4-22.png',
      fullContent: `
        <p><strong>Мы рады объявить, что первичное отделение «Движения Первых» в нашей школе открывает набор новых участников!</strong></p>
        <p>Если ты активен, полон идей, хочешь менять мир к лучшему и найти настоящих друзей — мы ждём именно тебя. «Движение Первых» — это не просто организация, это большая дружная семья, где каждый может найти себе занятие по душе и раскрыть свои таланты.</p>
        <h3>Что тебя ждёт?</h3>
        <ul>
          <li>Участие в крутых проектах и мероприятиях на уровне школы, города и даже страны.</li>
          <li>Возможность реализовать собственные социальные, творческие и волонтёрские инициативы.</li>
          <li>Новые знакомства, работа в команде и развитие лидерских качеств.</li>
          <li>Поддержка твоих идей и помощь в их воплощении.</li>
        </ul>
        <h3>Кто может присоединиться?</h3>
        <p>Мы приглашаем всех учеников нашей школы, которые хотят быть в центре событий, готовы действовать и быть первыми во всём!</p>
        <h3>Как стать частью команды?</h3>
        <p>Это очень просто! Обратись к руководителю нашего первичного отделения в школе или заполни заявку на официальном сайте <a href="https://будьвдвижении.рф" target="_blank" rel="noopener noreferrer">будьвдвижении.рф</a>. Подробности можно узнать в разделе «Как вступить» на нашем сайте.</p>
        <p><strong>Не упускай свой шанс! Присоединяйся к нам и давай вместе делать мир лучше!</strong></p>
      `
    }
  ]);

  selectedNewsItem = signal<NewsItem | null>(null);

  selectNews(item: NewsItem): void {
    this.selectedNewsItem.set(item);
  }

  closeNews(): void {
    this.selectedNewsItem.set(null);
  }

  currentYear = new Date().getFullYear();
}
