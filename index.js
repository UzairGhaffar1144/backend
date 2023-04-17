var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var mongoose = require("mongoose");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/api/users"); /////----------------1------------------

var productsRouter = require("./routes/api/products");
var moviesRouter = require("./routes/api/movies");
var webseriesRouter = require("./routes/api/webseries");
var patientsRouter = require("./routes/api/patients");
var psychologistsRouter = require("./routes/api/psychologists");
var discussionforumsRouter = require("./routes/api/discussionforums");
var appointmentsRouter = require("./routes/api/appointments");
var reviewsRouter = require("./routes/api/reviews");
var chatsRouter = require("./routes/api/chats");
var messagesRouter = require("./routes/api/messages");

process.env["NODE_CONFIG_DIR"] = path.join(path.resolve("./"), "config/");
var config = require("config");
var cors = require("cors");
var app = express();
app.use(cors());
// // view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/users/patients", patientsRouter);
app.use("/api/users/psychologists", psychologistsRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/discussionforums", discussionforumsRouter);
app.use("/api/chats", chatsRouter);
app.use("/api/messages", messagesRouter);

app.use("/api/products", productsRouter);
app.use("/api/movies", moviesRouter);
app.use("/api/webseries", webseriesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);

  // Send response
  res.send({
    message: err.message,
    error: err,
  });
  // res.send(err);
  // // // render the error page
  // // res.status(err.status || 500);
  // // res.render("error");
});
mongoose
  .connect(config.get("db"), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected to Mongo...."))
  .catch((error) => console.log(error.message));
module.exports = app;
