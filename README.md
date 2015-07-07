
# [![VCLogo](http://googledrive.com/host/0B_QkjcHRJY6weTlIakVsbkY5QjQ)](http://http://www.visualconnections.net//) 

# [Visual Connections Prototype Link](http://50.246.122.183/)

Visual Connections is very pleased to design, develop, and deliver the prototype for this BPA IDIQ contract. We understand and align clearly with the objectives of GSA-18F for agile delivery services. We have the experience, maturity and the most qualified  resources to oﬀer for this contract. The following paragraphs explain  the agile approach, processes,and technologies adopted for this approachThis prototype integrates with open FDA drugs data and demonstrates our capabilities in responsive user experience and delivers the prototype within the required  schedule. We treat responsive user experience as the end to end design rather than just the user interface. We believe responsive user experience as the integration of user interface, micro middleware services and flexible, scalable database. We have conducted a 508 Compliance Review on the prototype and the prototype we are proposing is as Section 508 compliant as we are able to make it in the time allowed. We have the capacity to make the prototype completely compliant and we can do that once we have been awarded the contract. 
##**1. Methodology**
#####**a. Scrum Approach:**
We are happy  to showcase our agile capabilities and process maturity for this prototype. Visual Connections treated this prototype as a real project and assigned the best of the processes and resources to the project.Visual Connections used Scrum Agile methodology to design, develop and test this prototype. We assigned roles for Product Owner, Scrum Master, Agile Coach, Technical Architect, User Experience expert, UI Developer, Software Programmer and Tester for our approach. We created a product backlog for the prototype requirement and features, which translated in to user stories. Since this is a very brief prototype,  we created  one sprint cycle  and  built most of the user stories. Noted below is the high level Scrum methodology  we utilized for this prototype
![AgileProcess](http://googledrive.com/host/0B_QkjcHRJY6waHg3QWo3ejVIMnM)
As part of the agile approach,  assigned points and user stories are also split in to multiple tasks. We included daily standups and user story level UI design reviews with the product owner to identify issues very early.We calculate daily points achievements and  updated the physical board. Following is our final burn down chart for the sprint 1 of our prototype.
![Burndown](http://googledrive.com/host/0B_QkjcHRJY6wWXR5bmViVzByNUE)

#####**c. Continuous Integration Process**For the Continuous Integration Process, we  setup an end to end continuous development and integration process to assure our agile process worked eﬃciently. Noted below  is a high-level integration architecture that we adopted for our continuous integration. This was key to our successful completion of the prototype.

![CIProcess](http://googledrive.com/host/0B_QkjcHRJY6wWDZBMjJMZC11c3c)
#####**c. Tools and processes**We utilized Rally as the Agile Development Management tool, Github as the source control and Strider CD as the continuous build management tool. ##**2. Technology**
After careful consideration and analysis, we decided to develop the prototype using Mean Stack, which is based on node.js architecture  and is completely open source. The main advantage of using Mean Stack was uniform language and no- sql flexible mongo database which helped us to turn around the prototype quickly.Along with Mean (Mongo, Express, Angular and Node) stack, we adopted card layout responsive user experience design based on bootstrap framework to support multiple devices and browsers.Noted below  is the high level technical architecture of the Mean stack used for the prototype.
![Architecture](http://googledrive.com/host/0B_QkjcHRJY6wWjIxUEFFSWN0cms)##**3. Benefits and Retrospective**
**Following are some of the benefits of our prototype approach:**
* We were able to successfully demonstrate our agile capabilities along with technical capabilities while adopting continuous integration with unit tests. This helped us identify defects early and reduce the reduced the need to fix dependency errors* Our agile approach included user experience design which helped us to come up with UI design reviewed and developed quickly* We were able to prove our git and open source capabilities with tools and technology selection

**Following are some of the areas of improvement for our prototype approach:**

* We would have demostrated our User Experience and Technology experience if we would have allocated more days
* Because of schedule restriction we executed only one sprint for the prototype

##**4. Installation Instructions** 
* Install mongoDB using the instructions specified here 
	[Mongo DB ](http://docs.mongodb.org/manual/installation/)
	* Install node.js using the instructions specified here [node.js](https://nodejs.org/download/)
* Clone the git repository
* Run npm install from the base directory to install all the package dependencies
* Optional steps include integration with nginx (Open source http server), pm2 (Node.js process manager) and http proxy for node.js on nginx and opening the app on [Prototype](http://localhost)
* if the above step is not needed, you can run the app by starting node server from the base directory and opening the webpage using  [http://localhost:3000](http://localhost:3000) 