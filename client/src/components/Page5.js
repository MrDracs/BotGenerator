import React from 'react';

const Page5 = () => {
  return (
    <>
      <section className="page5">
        <div className="page5-flex">
          <div className="page5-content">
            <h2 className="Bot" style={{ textAlign: "left" }}>Chat With The Agent</h2>
            <p>Here is a live preview of our chatbot in action. Feel free to interact and customize the experience.</p>
          </div>
          <div className="side-bar-fs">
            <iframe className='iframe' title="Chatbot Preview" src="http://localhost:3000/chat/66e6c24b607c2b1b5138872a" width="80%" height="100%" frameBorder="none"></iframe>
          </div>
        </div>
      </section>
      
      <footer>
          <p>&copy; 2024 Conversify. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Page5;
