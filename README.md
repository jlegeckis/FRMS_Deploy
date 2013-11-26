deployinator
============

The Deployinator is a central API for tracking deployments from remote servers. Each server will periodically check their associated repos for updates, and depending on that check will either tell this service that it's updated to version Y, tried to update to version Y, or is already at version X.

Requried Modules:
 * restify
 * mongoose

To tell the server a deployment has been completed, use a curl like this:

	curl -XPOST 'http://localhost:8080/deploy/<environment>' -d '{"server":"dsfrcweb02", "codebase":"frc", "location":"dc3", "release":"2013112111_N238"}' -H "Content-Type: application/json

To see what deployments a server has had:

	curl 'http://localhost:8080/latest/<servername>

To see the latest deployments on all servers: (thuogh right now it's just a list of servers and their last update date)

	curl 'http://localhost:8080/latest/_all
