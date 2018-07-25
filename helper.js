exports.buildStringFromList = function(list, format) {
    let str = '';
    list.foreach(function(item, i) {
      if (list.length > 1 && i == list.length - 1) str += 'and ';
      str += format(item);
      if (i != list.length - 1) {
        if (list.length > 1) str += ',';
        routes += ' ';
      }
    });
    return str;
  };