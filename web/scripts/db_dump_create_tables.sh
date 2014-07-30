mysqldump -u root reddit_scrubber -d --ignore-table=reddit_scrubber.SequelizeMeta | egrep -v "(^SET|^DROP TABLE|^/\*\!)"
