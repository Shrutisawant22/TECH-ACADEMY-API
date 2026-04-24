import Course from "../models/courseModel.js";

// ==========================
// 📥 GET ALL COURSES (ADVANCED)
// ==========================
export const getCourses = async (req, res, next) => {
  try {
    const {
      search,
      category,
      level,
      sort = "createdAt",
      page = 1,
      limit = 10
    } = req.query;

    // ======================
    // 🔍 FILTER OBJECT
    // ======================
    let queryObj = { isPublished: true };

    if (category) queryObj.category = category;
    if (level) queryObj.level = level;

    // ======================
    // 🔎 SEARCH (TEXT INDEX)
    // ======================
    if (search) {
      queryObj.$text = { $search: search };
    }

    // ======================
    // 📊 QUERY BUILDING
    // ======================
    let query = Course.find(queryObj);

    // ======================
    // 🔽 SORTING
    // ======================
    const sortOptions = {
      newest: "-createdAt",
      oldest: "createdAt",
      rating: "-rating",
      popular: "-studentsEnrolled"
    };

    query = query.sort(sortOptions[sort] || "-createdAt");

    // ======================
    // 📄 PAGINATION
    // ======================
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(Number(limit));

    // ======================
    // 📦 EXECUTE QUERY
    // ======================
    const courses = await query;

    const total = await Course.countDocuments(queryObj);

    res.status(200).json({
      status: "success",
      results: courses.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: courses
    });

  } catch (error) {
    next(error);
  }
};

// ==========================
// 🌱 SEED COURSES (AUTO DATA)
// ==========================
export const seedCourses = async (req, res, next) => {
  try {
    const count = await Course.countDocuments();

    if (count > 0) {
      return res.json({
        message: "Courses already exist"
      });
    }

    const sampleCourses = [
      {
        title: "Master Full Stack Web Development",
        description:
          "Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB to become a professional full-stack developer. Build real-world projects and deploy them.",
        category: "Web Development",
        level: "Beginner",
        duration: 40,
        rating: 4.8,
        studentsEnrolled: 1200,
        tags: ["React", "Node", "MongoDB"]
      },
      {
        title: "Data Science & Machine Learning Bootcamp",
        description:
          "Master Python, data analysis, visualization, and machine learning algorithms. Work on real datasets and build predictive models.",
        category: "Data Science",
        level: "Intermediate",
        duration: 50,
        rating: 4.7,
        studentsEnrolled: 950,
        tags: ["Python", "ML", "Pandas"]
      },
      {
        title: "AI & Deep Learning Mastery",
        description:
          "Dive deep into neural networks, deep learning, and AI systems. Learn TensorFlow, PyTorch, and build advanced AI models.",
        category: "AI & ML",
        level: "Advanced",
        duration: 60,
        rating: 4.9,
        studentsEnrolled: 700,
        tags: ["AI", "Deep Learning"]
      },
      {
        title: "Cyber Security Fundamentals",
        description:
          "Understand ethical hacking, network security, and how to protect systems from cyber attacks using real-world tools.",
        category: "Cyber Security",
        level: "Beginner",
        duration: 30,
        rating: 4.6,
        studentsEnrolled: 800,
        tags: ["Security", "Ethical Hacking"]
      },
      {
        title: "Cloud Computing with AWS",
        description:
          "Learn cloud architecture, AWS services, deployment strategies, and build scalable cloud applications.",
        category: "Cloud Computing",
        level: "Intermediate",
        duration: 35,
        rating: 4.7,
        studentsEnrolled: 650,
        tags: ["AWS", "Cloud"]
      }
    ];

    await Course.insertMany(sampleCourses);

    res.status(201).json({
      status: "success",
      message: "Sample courses seeded successfully"
    });

  } catch (error) {
    next(error);
  }
};