/**
 * click	    The event occurs when the user clicks on an element
 * dblclick	    The event occurs when the user double-clicks on an element
 * mousedown	The event occurs when a user presses a mouse button over an element
 * mousemove	The event occurs when the pointer is moving while it is over an element
 * mouseover	The event occurs when the pointer is moved onto an element
 * mouseout 	The event occurs when a user moves the mouse pointer out of an element
 * mouseup	    The event occurs when a user releases a mouse button over an element
 */
THREE.MouseEvents = (function(){

    var projector = new THREE.Projector();
    var lastMouseEventX = 0;
    var lastMouseEventY = 0;

    /**
     * registers the given callback as a document event, with a function between it calculating any intersections with
     * any of the objects within the given object array.
     *
     * @param name event name, ie `mousedown`
     * @param camera
     * @param objects most likely scene#children
     * @param callback :function(intersects, event)
     * @param preventDefault (optional, default false)
     * @returns {Function}
     */
    var listen = function(names, camera, objects, callback, preventDefault){
        var preventDefault = preventDefault || false;
        var eventListener = function(event) {
            if(event && preventDefault){
                event.preventDefault();
            }
            // with this, we also assume there is only one mouse but i think that's Ok
            lastMouseEventX = event ? event.clientX : lastMouseEventX;
            lastMouseEventY = event ? event.clientX : lastMouseEventX;
            // TODO: find out what the magic numbers mean here (0.5?)
            var vector = new THREE.Vector3(
                (lastMouseEventX / window.innerWidth) * 2 - 1,
              - (lastMouseEventY / window.innerHeight) * 2 + 1,
                0.5
            );
            projector.unprojectVector(vector, camera);
            var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());
            var intersects = ray.intersectObjects(objects);
            callback(intersects);
        };
        for(var i in names){
            document.addEventListener(names[i], eventListener, false);
        }
        return eventListener;
    };

    /**
     * Sets up the event listeners for a given scene and camera, it is assumed the scene spans accross the
     * entirity of `window`, also, this function returns the move event listener which you must call with no args every
     * single time that you rerender the scene for the camera, so that any move events can also be emitted by moving
     * objects in the scene, and not by moving the mouse. If you do not do this elements can move without them
     * triggering events when they go or leave "under the mouse".
     *
     * @param scene
     * @param camera
     * @returns {Function}
     */
    return function(scene, camera){

        // just propagate the event to the first intersected object
        listen(['click', 'dblclick', 'mousedown', 'mouseup'], camera, scene.children, function(intersects, event){
            if(intersects.length > 0){
                var intersect = intersects[0];
                intersect.on(event.type, event);
            }
        });

        // for the move events we need to keep track of what the last object was that received a move event so we can
        // calculate when we emit a `mouseout` event.
        var lastIntersected;
        return listen(['mousemove'], camera, scene.children, function(intersects, event){
            if (intersects.length > 0){
                var intersected = intersects[0];
                if (intersected != lastIntersected){
                    lastIntersected.on('mouseout', event);
                    intersected.on('mouseover', event);
                    lastIntersected = intersected;
                }
                intersected.on('mousemove', event);
            }
            else if (lastIntersected){
                lastIntersected.on('mouseout', event);
                lastIntersected = null;
            }
        });

        return moveListener;

    };

    // TODO: possibly we have to add a THREE mesh prototype `on` default method if there isn't already one

})();