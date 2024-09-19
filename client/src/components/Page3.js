import React from 'react';

const Page3 = () => {
  return (
    <section className="page3">
        <section className="feature no-code">
            <div className="feature-content">
                <h2>No Code <img src="asset\gifs\code.gif" alt="Code illustration" className="code" /></h2>
                <p>Not everyone has the pizzazz to write code—so leave that to us!</p>
                <p>We've made it incredibly easy for you to get your own agent, tailored to your needs.</p>
            </div>
            <div className="feature-image">
                <img src="asset\images\computer.png" alt="Code editor illustration" className="computer" />
                <div className="question-marks">
                    <img src="asset\images\question.png" alt="question" className="question" />
                </div>
            </div> 
        </section>
        
        <section className="feature">
            <div className="f-content">
                <h2>Human Like<img src="asset\images\person.png" alt="Code illustration" className="code" /></h2>
                <p>Next level of customer interaction! Our lifelike 3D model speaks, giving your customers a dynamic, human-like experience.</p>
                <p>Through text or voice, your agent will engage with flair, making every conversation feel personal and fun!</p>
            </div>
            <div className="feature-image">
                <img src="asset/images/support.png" alt="Human-like interaction illustration" className="human" />
            </div>
        </section>

        <section className="feature no-code">
            <div className="feature-content">
                <h2>Ofcourse A.I. <img src="asset/images/star.png" alt="star interaction illustration" className="code" /></h2>
                <p>AI, our friend from the future brings cutting-edge intelligence to your chatbot. </p>
                <p>You can build your agent with Top of the line A.I. models like Chat Mistral,Llama 3.1 We tailor it perfectly to your needs!</p>
            </div>
            <div className="feature-image">
                <img src="asset\images\friend.png" alt="Code editor illustration" className="computer" />
                </div>
        </section>
    </section>
  );
};

export default Page3;
