import { useNavigate } from "react-router-dom";
import "./LandingPage.css"
import { handleGoogleAuthentication } from "../../services/auth.service";


  
export default function LandingPage() {
    const navigate = useNavigate();
    const handleGetStarted = async () => {
    try {
      await handleGoogleAuthentication();
      navigate('/home');
    } catch (error) {
      console.error('Auth failed:', error);
    }
  };

    return (
        <>
            <header>
                <a href="#" className="logo">Timesheeter</a>
            </header>
            <main>
                <section className="hero">
                    <article className="container">
                        <h1>
                            Track time.<br />
                            <span className="highlight">Achieve more.</span>
                        </h1>
                        <p>
                            Effortless time tracking with real-time analytics, simple projects, and uncompromising flow.
                        </p>
                        <button className="cta-btn" onClick={handleGetStarted}>
                            Get Started Free
                        </button>
                        <p className="trusted">
                            Trusted by 50,000+ professionals worldwide
                        </p>
                    </article>
                </section>

                <section className="features" id="features">
                    <article className="container">
                        <h2>Simple, powerful time tracking</h2>
                        <p className="features-subtitle">
                            Everything you need to track time effectively and boost your productivity
                        </p>

                        <article className="features-grid">
                            <article className="feature-card">
                                <figure className="feature-icon">⏱️</figure>
                                <h3>Real-Time Tracking</h3>
                                <p>
                                    Start and stop timers instantly. Track your work in real-time with intuitive controls and instant feedback.
                                </p>
                            </article>

                            <article className="feature-card">
                                <figure className="feature-icon">📊</figure>
                                <h3>Live Analytics</h3>
                                <p>
                                    Visualize your time with beautiful charts and reports. Get insights into where your time goes.
                                </p>
                            </article>

                            <article className="feature-card">
                                <figure className="feature-icon">🎯</figure>
                                <h3>Daily Goals</h3>
                                <p>
                                    Set daily time goals and track your progress. Stay motivated and hit your targets consistently.
                                </p>
                            </article>

                            <article className="feature-card">
                                <figure className="feature-icon">📁</figure>
                                <h3>Categories</h3>
                                <p>
                                    Organize your time with custom categories. Filter and analyze your activities with ease.
                                </p>
                            </article>
                        </article>
                    </article>
                </section>

                <section className="cta-section">
                    <article className="container">
                        <h2>Start tracking in seconds</h2>
                        <p>
                            Join thousands of professionals who've transformed their productivity with our simple, powerful time tracking solution.
                        </p>
                        <button className="cta-btn" onClick={handleGetStarted}>
                            Get Started Free
                        </button>
                    </article>
                </section>
            </main>

            <footer>
                <article className="container">
                    <ul className="footer-links">
                        <li><a href="#privacy">Privacy</a></li>
                        <li><a href="#terms">Terms</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                    <p className="copyright">
                        © 2025 TimeTracker. All rights reserved.
                    </p>
                </article>
            </footer>
        </>
    );
}