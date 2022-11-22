# Simple Polls API

This is a template for building a straw poll API. Using express.js and sqlite3.

The API allows for poll creation, voting, and deletion. No authentication is used in this template.


Routes | polls | vote |
--- | --- | --- |
GET | `/polls` Gets all polls. `/polls/:id` Gets polls with id|  |
POST| `/polls` Create a poll. Required fields: `question, choice1, choice2` | `/vote/:pollId/:choice` Vote for nth choice on given poll.
DELETE| `/polls/:id` Delete poll with ID. | |

Things to do:

* Allow polls to have more than 2 questions.
* Authentication system to prevent multi-voting and add data security
