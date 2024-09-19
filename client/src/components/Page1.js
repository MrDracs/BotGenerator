import React from 'react';

const Page1 = () => {
  return (
    <div class="page1">
        <img src="./asset/gifs/top_right.gif" alt="book.gif" class="top-right-image" />
        <nav>
            <ul class="navbar">
                <li><a href="#">Home</a></li>
                <li><a href="#">Features</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Join Us</a></li>
                <li><a href="#">Demo</a></li>
            </ul>
        </nav>
        <header>
            <h1>WELCOME</h1>
            <h2>To</h2>
            <h3>Conversify</h3>
        </header>
        <section class="features">
            <h2>Features</h2>
            <div class="feature-cards">
                <img src="./asset/gifs/bottom_left.gif" alt="gif" class="bottom-left-image" />
                <div class="card yellow">
                    <div class="arch"></div>
                    <div class="smallarch"></div>
                    <h3>No Coding Required</h3>
                    <p>We will handle that!</p>
                </div>
                <div class="card orange">
                    <div class="ladder"></div>
                    <h3>Human like Interaction</h3>
                    <p>Your New Best Friend!</p>
                </div>
                <div class="card green">
                    <div class="star"></div>
                    <h3>Artificial Intelligence</h3>
                    <p>Keeping up with technology</p>
                </div>
            </div>
        </section>
    </div>
  );
};

export default Page1;
