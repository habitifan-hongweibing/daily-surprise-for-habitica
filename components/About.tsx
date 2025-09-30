import React from 'react';

const About: React.FC = () => {
  const headingStyle = "text-3xl font-bold mb-6 text-center text-habitica-light";

  return (
    <div className="max-w-4xl mx-auto bg-habitica-dark p-6 sm:p-8 rounded-lg shadow-xl animate-fade-in">
      
      <div className="pb-8">
        <h1 className={headingStyle}>About Daily Surprise</h1>
        <div className="space-y-4 text-habitica-text-secondary max-w-3xl mx-auto">
          <p className="text-lg">
            Imagine starting your day not with a to-do list, but with a small adventure. What will you discover today? Write a haiku? Start a conversation with a stranger? Or find something perfectly round on the street?
          </p>
          <p className="text-lg">
            Daily Surprise is your personal generator of new impressions. Simply create a bank of small (or big!) challenges you'd like to try, and our app will randomly throw you one per day. This is not about productivity. This is about variety.
          </p>
          <p className="text-lg">
            Turn your life into an exciting exploration where every day gives you a new experience. And your Habitica will become a convenient reminder and diary of this journey.
          </p>
        </div>
      </div>

      <hr className="border-t-2 border-habitica-main opacity-50 my-8" />

      <div className="py-8">
        <h2 className={headingStyle}>How to Use</h2>
        <ol className="list-decimal list-inside space-y-3 text-habitica-text-secondary max-w-md mx-auto text-lg">
            <li>Enter your Habitica credentials in the Profile section.</li>
            <li>Go to "Create Challenge" and choose a task bank (or make your own!).</li>
            <li>Set a schedule and create the challenge in Habitica.</li>
            <li>Visit "My Challenges" each day and click "Generate Today's Task".</li>
            <li>Your new task will magically appear in your Habitica Dailies!</li>
        </ol>
      </div>

      <hr className="border-t-2 border-habitica-main opacity-50 my-8" />

      <div className="pt-8">
        <h2 className={headingStyle}>About the Developer</h2>
        <div className="space-y-4 text-habitica-text-secondary max-w-3xl mx-auto">
           <p className="text-lg">
              Hi! My name is <a href="https://habitica.com/profile/d5edea78-6f44-43d6-83ef-fc9da1cbcae2" target="_blank" rel="noopener noreferrer" className="text-habitica-light hover:underline">@hongweibing</a>.
          </p>
          <p className="text-lg">
              I am a big fan of Habitica, and I am trying to make the experience of using it even better. On <a href="https://storm-girdle-c18.notion.site/Useful-tools-for-Habitica-26486e08ea8a80f791bbd192356d3c6c" target="_blank" rel="noopener noreferrer" className="text-habitica-light hover:underline">this page</a>, I will post useful scripts, utilities, apps and other materials that may be useful to you. If you have any ready-made materials or ideas, you can write to me.
          </p>
          <p className="text-lg">
              You can also give me a couple of <span className="text-green-400 font-semibold">gems</span> if you find these materials useful :) But this is not necessary. The main thing is to develop yourself and achieve your goals!
          </p>
          <p className="text-lg">
              Good luck!
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;