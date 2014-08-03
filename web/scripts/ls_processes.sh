ps -axf | grep 'reddit-scrubber-daemon' | grep -v grep | awk '{ print "pid:"$2", parent-pid:"$3 }'
